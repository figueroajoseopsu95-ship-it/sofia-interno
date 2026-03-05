import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ParserService } from './parser.service';
import { OcrService } from './ocr.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
    imports: [KnowledgeModule], // Need access to ChunkingService & EmbeddingService
    controllers: [DocumentsController],
    providers: [DocumentsService, ParserService, OcrService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
