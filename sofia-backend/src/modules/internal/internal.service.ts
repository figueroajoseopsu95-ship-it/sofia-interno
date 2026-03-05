import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RagService } from '../rag/rag.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { GoogleChatService } from '../google-chat/google-chat.service';
import { LogExecutionDto } from './dtos/log-execution.dto';
import { InternalSearchDto } from './dtos/internal-search.dto';

@Injectable()
export class InternalService {
    private readonly logger = new Logger(InternalService.name);

    constructor(
        private prisma: PrismaService,
        private ragService: RagService,
        private usersService: UsersService,
        private chatService: ChatService,
        private googleChatService: GoogleChatService
    ) { }

    // --- RAG DELEGATIONS ---
    async ragSearch(dto: InternalSearchDto) {
        return this.ragService.search({
            query: dto.query,
            collectionCode: dto.collectionCode,
            topK: dto.topK || 5,
            useHybrid: false // Fast raw vector by default for internal agent tools
        });
    }

    async ragSearchHybrid(dto: InternalSearchDto) {
        return this.ragService.search({
            query: dto.query,
            collectionCode: dto.collectionCode,
            topK: dto.topK || 5,
            useHybrid: true
        });
    }

    // --- KNOWLEDGE DELEGATIONS ---
    async getCollections() {
        return this.prisma.collection.findMany({ where: { isActive: true } });
    }

    async getDocumentChunks(documentId: string) {
        return this.prisma.documentChunk.findMany({
            where: { documentId },
            orderBy: { chunkIndex: 'asc' },
            select: { id: true, content: true, pageNumbers: true, sectionTitle: true }
        });
    }

    // --- USER DELEGATIONS ---
    async getUserProfile(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, position: true }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async getUserDepartments(id: string) {
        return this.prisma.userDepartment.findMany({
            where: { userId: id, department: { isActive: true } },
            include: { department: true }
        });
    }

    // --- CONTEXT DELEGATIONS ---
    async getConversationContext(id: string, limit: number = 10) {
        return this.prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    // --- AGENT LOGGING ---
    async logExecution(dto: LogExecutionDto) {
        this.logger.debug(`Logging execution for agent: ${dto.agentName}`);

        return this.prisma.agentExecutionLog.create({
            data: {
                conversationId: dto.conversationId,
                agentName: dto.agentName,
                agentVersion: dto.agentVersion,
                status: dto.status || 'success',
                inputPayload: dto.inputPayload || {},
                outputPayload: dto.outputPayload || {},
                toolsInvoked: dto.toolsInvoked || {},
                chunksRetrieved: dto.chunksRetrieved || {},
                chunksUsedInResponse: dto.chunksUsedInResponse || 0,
                llmModel: dto.llmModel,
                totalTokens: dto.totalTokens,
                promptTokens: dto.promptTokens,
                completionTokens: dto.completionTokens,
                costUsd: dto.costUsd,
                latencyMs: dto.latencyMs,
                n8nExecutionId: dto.n8nExecutionId
            }
        });
    }

    // --- GOOGLE CHAT DELEGATIONS ---
    async sendGoogleChatMessage(spaceId: string, message: string) {
        // Usually invokes a method in googleChatService to push to google api
        // For this scaffold we just mock success
        this.logger.log(`Mocking proactive push to GChat space: ${spaceId}`);
        return { success: true, message: 'Message queued for delivery' };
    }
}
