import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChunkResultDto } from './dtos/search-result.dto';

interface SearchOptions {
    collectionCode?: string;
    topK: number;
    threshold?: number;
}

@Injectable()
export class RetrievalService {
    private readonly logger = new Logger(RetrievalService.name);

    constructor(private prisma: PrismaService) { }

    async vectorSearch(embedding: number[], options: SearchOptions): Promise<ChunkResultDto[]> {
        this.logger.debug(`Executing vector search (pgvector) - topK: ${options.topK}`);

        const { topK, collectionCode } = options;
        const vectorString = `[${embedding.join(',')}]`;

        // We construct the query mapping to exact SQL for pgvector
        // If collectionCode is provided, we join collections through documents
        let results: any[];

        if (collectionCode) {
            results = await this.prisma.$queryRaw`
        SELECT 
          c.id AS "chunkId", 
          c.content, 
          c.section_title AS "sectionTitle", 
          c.page_numbers AS "pageNumbers", 
          d.id AS "documentId",
          d.title AS "documentTitle",
          1 - (c.embedding <=> ${vectorString}::vector) AS score
        FROM knowledge.document_chunks c
        JOIN knowledge.documents d ON c.document_id = d.id
        JOIN knowledge.collections col ON d.collection_id = col.id
        WHERE col.code = ${collectionCode}
          AND d.status = 'indexed'
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT ${topK}
      `;
        } else {
            results = await this.prisma.$queryRaw`
        SELECT 
          c.id AS "chunkId", 
          c.content, 
          c.section_title AS "sectionTitle", 
          c.page_numbers AS "pageNumbers", 
          d.id AS "documentId",
          d.title AS "documentTitle",
          1 - (c.embedding <=> ${vectorString}::vector) AS score
        FROM knowledge.document_chunks c
        JOIN knowledge.documents d ON c.document_id = d.id
        WHERE d.status = 'indexed'
        ORDER BY c.embedding <=> ${vectorString}::vector
        LIMIT ${topK}
      `;
        }

        return results.map(r => ({
            chunkId: r.chunkId,
            documentId: r.documentId,
            documentTitle: r.documentTitle,
            content: r.content,
            score: Number(r.score),
            pageNumbers: Array.isArray(r.pageNumbers) ? r.pageNumbers : [],
            sectionTitle: r.sectionTitle,
        }));
    }

    async fulltextSearch(query: string, options: SearchOptions): Promise<ChunkResultDto[]> {
        this.logger.debug(`Executing fulltext search (pg_trgm) - query: ${query}`);

        const { topK, collectionCode } = options;

        // We use pg_trgm similarity logic and unaccent for robust search
        let results: any[];

        if (collectionCode) {
            results = await this.prisma.$queryRaw`
        SELECT 
          c.id AS "chunkId", 
          c.content, 
          c.section_title AS "sectionTitle", 
          c.page_numbers AS "pageNumbers", 
          d.id AS "documentId",
          d.title AS "documentTitle",
          similarity(unaccent(lower(c.content)), unaccent(lower(${query}))) AS score
        FROM knowledge.document_chunks c
        JOIN knowledge.documents d ON c.document_id = d.id
        JOIN knowledge.collections col ON d.collection_id = col.id
        WHERE col.code = ${collectionCode}
          AND d.status = 'indexed'
          AND unaccent(lower(c.content)) % unaccent(lower(${query}))
        ORDER BY score DESC
        LIMIT ${topK}
      `;
        } else {
            results = await this.prisma.$queryRaw`
        SELECT 
          c.id AS "chunkId", 
          c.content, 
          c.section_title AS "sectionTitle", 
          c.page_numbers AS "pageNumbers", 
          d.id AS "documentId",
          d.title AS "documentTitle",
          similarity(unaccent(lower(c.content)), unaccent(lower(${query}))) AS score
        FROM knowledge.document_chunks c
        JOIN knowledge.documents d ON c.document_id = d.id
        WHERE d.status = 'indexed'
          AND unaccent(lower(c.content)) % unaccent(lower(${query}))
        ORDER BY score DESC
        LIMIT ${topK}
      `;
        }

        return results.map(r => ({
            chunkId: r.chunkId,
            documentId: r.documentId,
            documentTitle: r.documentTitle,
            content: r.content,
            score: Number(r.score),
            pageNumbers: Array.isArray(r.pageNumbers) ? r.pageNumbers : [],
            sectionTitle: r.sectionTitle,
        }));
    }

    async hybridSearch(query: string, embedding: number[], options: SearchOptions): Promise<ChunkResultDto[]> {
        this.logger.debug('Executing Hybrid Search (Vector + Fulltext)');

        // 1. Run both queries in parallel, fetching slightly more records for better RRF overlap
        const expandedOptions = { ...options, topK: options.topK * 2 };

        const [vectorResults, textResults] = await Promise.all([
            this.vectorSearch(embedding, expandedOptions),
            this.fulltextSearch(query, expandedOptions)
        ]);

        // 2. Perform Reciprocal Rank Fusion (RRF)
        const fusedResults = this.reciprocalRankFusion(vectorResults, textResults);

        // 3. Optional absolute thresholding on the original scores if strictly needed
        let filtered = fusedResults;
        if (options.threshold) {
            // Only keep if the original best score (vector or text) surpasses threshold roughly
            filtered = fusedResults.filter(r => r.score >= (options.threshold || 0));
        }

        // 4. Truncate to desired TopK
        return filtered.slice(0, options.topK);
    }

    private reciprocalRankFusion(vectorResults: ChunkResultDto[], textResults: ChunkResultDto[], k = 60): ChunkResultDto[] {
        const fusedScores = new Map<string, { item: ChunkResultDto, rrfScore: number, maxOrigScore: number }>();

        // Process vector rankings
        vectorResults.forEach((item, index) => {
            const rank = index + 1;
            const rrfScore = 1 / (k + rank);

            fusedScores.set(item.chunkId, {
                item,
                rrfScore,
                maxOrigScore: item.score
            });
        });

        // Process text rankings
        textResults.forEach((item, index) => {
            const rank = index + 1;
            const textRrfScore = 1 / (k + rank);

            if (fusedScores.has(item.chunkId)) {
                const existing = fusedScores.get(item.chunkId)!;
                existing.rrfScore += textRrfScore;
                existing.maxOrigScore = Math.max(existing.maxOrigScore, item.score);
                fusedScores.set(item.chunkId, existing);
            } else {
                fusedScores.set(item.chunkId, {
                    item,
                    rrfScore: textRrfScore,
                    maxOrigScore: item.score
                });
            }
        });

        // Convert map to array and sort by fused RRF score
        const fusedArray = Array.from(fusedScores.values());
        fusedArray.sort((a, b) => b.rrfScore - a.rrfScore);

        // Map back to ChunkResultDto, preserving original max score for downstream reference if needed
        // but the array is sorted by the hybrid relevance
        return fusedArray.map(f => {
            // We can optionally rewrite the score to reflect the hybrid confidence mapped to 0-1
            const normalizedScore = Math.min(f.rrfScore * 100, 1);
            return {
                ...f.item,
                score: f.maxOrigScore // Keep the highest original score to reflect match quality
            };
        });
    }
}
