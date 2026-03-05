import { Injectable, Logger } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { RerankerService } from './reranker.service';
import { EmbeddingService } from '../knowledge/embedding.service';
import { SearchQueryDto } from './dtos/search-query.dto';
import { SearchResultDto } from './dtos/search-result.dto';

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);

    constructor(
        private retrievalService: RetrievalService,
        private rerankerService: RerankerService,
        private embeddingService: EmbeddingService,
    ) { }

    async search(queryDto: SearchQueryDto): Promise<SearchResultDto> {
        const startTime = Date.now();
        this.logger.log(`Received RAG search query: "${queryDto.query}"`);

        // 1. Generate Embeddings for Query
        const queryEmbedding = await this.embeddingService.generateEmbedding(queryDto.query);

        // 2. Retrieval Phase
        let chunks = [];
        const options = {
            collectionCode: queryDto.collectionCode,
            topK: queryDto.topK || 5,
            threshold: queryDto.threshold || 0.6,
        };

        if (queryDto.useHybrid) {
            chunks = await this.retrievalService.hybridSearch(queryDto.query, queryEmbedding, options);
        } else {
            chunks = await this.retrievalService.vectorSearch(queryEmbedding, options);
            // Optional fallback filtering by threshold for pure vector search
            if (options.threshold) {
                chunks = chunks.filter(c => c.score >= options.threshold);
            }
        }

        // 3. Reranking Phase (if applicable and configured)
        const rerankedChunks = await this.rerankerService.rerank(queryDto.query, chunks);

        const searchTimeMs = Date.now() - startTime;
        this.logger.log(`RAG Search completed in ${searchTimeMs}ms. Found ${rerankedChunks.length} chunks.`);

        return {
            chunks: rerankedChunks,
            totalFound: rerankedChunks.length,
            searchTimeMs
        };
    }
}
