import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RagAnalyticsService } from './rag-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@ApiTags('Admin Control Center - RAG & Knowledge Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/knowledge')
export class RagAnalyticsController {
    constructor(private readonly ragAnalyticsService: RagAnalyticsService) { }

    @Get('quality')
    @ApiOperation({ summary: 'Get metrics on retrieval quality and chunks usage' })
    async getQuality() {
        return this.ragAnalyticsService.getQualityMetrics();
    }

    @Get('documents')
    @ApiOperation({ summary: 'List all documents with RAG stats' })
    async getDocuments(@Query() pagination: PaginationQueryDto) {
        return this.ragAnalyticsService.getDocumentsStats(pagination);
    }

    @Post('documents')
    @ApiOperation({ summary: 'Trigger a new document ingestion job' })
    async uploadDocument(@Body() body: any) {
        return this.ragAnalyticsService.uploadDocument(body);
    }

    @Get('chunks')
    @ApiOperation({ summary: 'Explore chunks available in Vector DB' })
    async exploreChunks(
        @Query() pagination: PaginationQueryDto,
        @Query('documentId') documentId?: string
    ) {
        return this.ragAnalyticsService.getChunksExplorer(pagination, { documentId });
    }

    @Get('collections')
    @ApiOperation({ summary: 'List collections and their document counts' })
    async getCollectionsStats() {
        return this.ragAnalyticsService.getCollectionsStats();
    }
}
