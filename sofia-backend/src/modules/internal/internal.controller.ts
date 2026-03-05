import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalService } from './internal.service';
import { InternalApiKeyGuard } from '../../common/guards/internal-api-key.guard';
import { LogExecutionDto } from './dtos/log-execution.dto';
import { InternalSearchDto } from './dtos/internal-search.dto';

// This controller acts as a unified facade for n8n to call various internal methods.
// Uses API Key instead of JWT since it's server-to-server.
@ApiTags('Internal Integrations (n8n Tools)')
@ApiSecurity('x-internal-api-key')
@UseGuards(InternalApiKeyGuard)
@Controller('internal/v1')
export class InternalController {
    constructor(private readonly internalService: InternalService) { }

    // --- RAG ENDPOINTS ---
    @Post('rag/search')
    async ragSearch(@Body() dto: InternalSearchDto) {
        return this.internalService.ragSearch(dto);
    }

    @Post('rag/search/hybrid')
    async ragSearchHybrid(@Body() dto: InternalSearchDto) {
        return this.internalService.ragSearchHybrid(dto);
    }

    @Post('rag/rerank')
    async ragRerank(@Body() data: any) {
        // Delegated to Rag Reranker manually if needed
        return { status: 'mocked', chunks: data.chunks };
    }

    // --- KNOWLEDGE ENDPOINTS ---
    @Get('knowledge/collections')
    async getCollections() {
        return this.internalService.getCollections();
    }

    @Get('knowledge/documents/:id/chunks')
    async getChunks(@Param('id') documentId: string) {
        return this.internalService.getDocumentChunks(documentId);
    }

    // --- USER ENDPOINTS ---
    @Get('users/:id/profile')
    async getUserProfile(@Param('id') userId: string) {
        return this.internalService.getUserProfile(userId);
    }

    @Get('users/:id/department')
    async getUserDepartment(@Param('id') userId: string) {
        return this.internalService.getUserDepartments(userId);
    }

    // --- CONVERSATION ENDPOINTS ---
    @Get('conversations/:id/context')
    async getConversationContext(@Param('id') id: string) {
        return this.internalService.getConversationContext(id);
    }

    // --- AGENT LOGGING ---
    @Post('agents/log-execution')
    @ApiOperation({ summary: 'Register deep log of n8n execution variables into DB' })
    async logAgentExecution(@Body() dto: LogExecutionDto) {
        return this.internalService.logExecution(dto);
    }

    // --- GOOGLE CHAT ---
    @Post('google-chat/send')
    async sendGoogleChatMessage(@Body() payload: { spaceId: string; message: string }) {
        return this.internalService.sendGoogleChatMessage(payload.spaceId, payload.message);
    }
}
