import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { EmbeddingService } from './embedding.service';
import { ChunkingService } from './chunking.service';

@Module({
    controllers: [KnowledgeController],
    providers: [KnowledgeService, EmbeddingService, ChunkingService],
    exports: [KnowledgeService, EmbeddingService, ChunkingService], // Exposed for documents module
})
export class KnowledgeModule { }
