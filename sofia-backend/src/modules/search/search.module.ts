import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { RagModule } from '../rag/rag.module';

@Module({
    imports: [RagModule], // Search depends heavily on the core RAG pipeline
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
