import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { SearchQueryDto } from './dtos/search-query.dto';
import { SearchResultDto, ChunkResultDto } from './dtos/search-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RerankerService } from './reranker.service';

@ApiTags('RAG System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rag')
export class RagController {
    constructor(
        private readonly ragService: RagService,
        private readonly rerankerService: RerankerService
    ) { }

    @Post('search')
    @HttpCode(200)
    @ApiOperation({ summary: 'Perform vector similarity search' })
    @ApiResponse({ status: 200, type: SearchResultDto })
    async search(@Body() queryDto: SearchQueryDto) {
        queryDto.useHybrid = false; // Force vector only
        return this.ragService.search(queryDto);
    }

    @Post('search/hybrid')
    @HttpCode(200)
    @ApiOperation({ summary: 'Perform hybrid search (Vector + Fulltext + RRF)' })
    @ApiResponse({ status: 200, type: SearchResultDto })
    async hybridSearch(@Body() queryDto: SearchQueryDto) {
        queryDto.useHybrid = true; // Force hybrid
        return this.ragService.search(queryDto);
    }

    @Post('rerank')
    @HttpCode(200)
    @ApiOperation({ summary: 'Rerank existing chunks for a given query' })
    @ApiResponse({ status: 200, type: [ChunkResultDto] })
    async rerank(@Body() data: { query: string; chunks: ChunkResultDto[] }) {
        return this.rerankerService.rerank(data.query, data.chunks);
    }
}
