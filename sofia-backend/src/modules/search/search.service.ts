import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RagService } from '../rag/rag.service';
import { SearchRequestDto } from './dtos/search-request.dto';
import { SearchResponseDto, EnrichedDocumentDto } from './dtos/search-response.dto';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private ragService: RagService,
        private prisma: PrismaService,
    ) { }

    async search(searchReq: SearchRequestDto, userId: string, correlationId: string): Promise<SearchResponseDto> {

        // 1. Audit Log 
        this.logger.log(`User ${userId} requested search for: "${searchReq.query}"`);
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'SEARCH',
                details: { query: searchReq.query, collectionCode: searchReq.collectionCode },
                ipAddress: '', // Handled by interceptor or standard logging ideally, left blank here as placeholder
                correlationId
            }
        });

        // 2. Call RAG Pipeline
        const ragResult = await this.ragService.search({
            query: searchReq.query,
            collectionCode: searchReq.collectionCode,
            topK: searchReq.maxResults || 5, // Top chunks
            useHybrid: true,  // Main search endpoint always uses hybrid for best quality
            threshold: 0.5, // Lenient threshold to allow Reranker to filter
        });

        // 3. Enrich & Format the Results into User-Friendly DTO
        // RAG outputs precise chunks. We summarize them into distinct documents 
        // or keep the chunk granularity if the UI needs to highlight exact sections. Let's return enriched snippets.

        const enrichedResults: EnrichedDocumentDto[] = [];

        for (const chunk of ragResult.chunks) {
            this.logger.debug(`Processing result: Doc ${chunk.documentTitle} Score ${chunk.score}`);

            // Let's bring in the collection info
            const document = await this.prisma.document.findUnique({
                where: { id: chunk.documentId },
                include: { collection: true }
            });

            if (document) {
                enrichedResults.push({
                    documentId: chunk.documentId,
                    title: chunk.documentTitle || document.title,
                    collectionName: document.collection.name,
                    snippet: this.cleanSnippet(chunk.content, searchReq.query),
                    score: chunk.score,
                    pageNumbers: chunk.pageNumbers,
                });
            }
        }

        return {
            query: searchReq.query,
            results: enrichedResults,
            searchTimeMs: ragResult.searchTimeMs
        };
    }

    // Very basic highlighter for context strings.
    // In a complex app, we might just return the markdown or string directly 
    private cleanSnippet(content: string, query: string): string {
        // Truncate overly long content focusing around match if possible, 
        // but right now just standard truncation is okay since chunks are small.
        if (content.length > 500) {
            return content.substring(0, 500) + '...';
        }
        return content;
    }
}
