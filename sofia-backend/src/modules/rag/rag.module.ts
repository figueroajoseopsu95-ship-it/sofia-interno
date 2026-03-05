import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { RetrievalService } from './retrieval.service';
import { RerankerService } from './reranker.service';
import { KnowledgeModule } from '../knowledge/knowledge.module'; // for Embedding Service

@Module({
    imports: [KnowledgeModule],
    controllers: [RagController],
    providers: [RagService, RetrievalService, RerankerService],
    exports: [RagService], // Export so Search/Agents modules can use it
})
export class RagModule { }
