import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ConversationStatus, MessageRole } = require('@prisma/client');
import axios from 'axios';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private readonly n8nWebhookUrl: string;
    private readonly internalApiKey: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        // The webhook URL exposed by the n8n router agent
        this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || '';
        this.internalApiKey = this.configService.get<string>('INTERNAL_API_KEY') || '';
    }

    async createConversation(userId: string, channel: string, title?: string) {
        return this.prisma.conversation.create({
            data: {
                userId,
                channel: channel as any,
                title: title || 'Nueva Conversación',
                status: ConversationStatus.active,
            }
        });
    }

    async getConversations(userId: string, pagination: PaginationQueryDto) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [total, conversations] = await this.prisma.$transaction([
            this.prisma.conversation.count({ where: { userId } }),
            this.prisma.conversation.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            })
        ]);

        const mapped = conversations.map(c => ({
            ...c,
            lastMessage: c.messages[0]?.content || null
        }));

        return {
            data: mapped,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getConversationDetail(id: string, userId: string, pagination: PaginationQueryDto) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id, userId }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const [totalMsg, messages] = await this.prisma.$transaction([
            this.prisma.message.count({ where: { conversationId: id } }),
            this.prisma.message.findMany({
                where: { conversationId: id },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' }, // usually chronological for chat views
            })
        ]);

        return {
            ...conversation,
            messages: {
                data: messages,
                meta: { total: totalMsg, page, limit, totalPages: Math.ceil(totalMsg / limit) }
            }
        };
    }

    async sendMessage(conversationId: string, userId: string, content: string) {
        this.logger.log(`New message in conversation ${conversationId} by User ${userId}`);

        // 1. Verify and get conversation
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId, userId } });
        if (!conversation) throw new NotFoundException('Conversation not found');
        if (conversation.status === ConversationStatus.closed) throw new NotFoundException('Conversation is closed');

        // 2. Load context history (Last 10 messages for context)
        const history = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        const formattedHistory = history.reverse().map(m => ({
            role: m.role,
            content: m.content
        }));

        // 3. Save User Message
        const userMessage = await this.prisma.message.create({
            data: {
                conversationId,
                role: MessageRole.user,
                content
            }
        });

        // 4. Send to n8n Webhook
        let n8nResponse: any;
        const startTime = Date.now();

        try {
            this.logger.debug(`Calling n8n Router Agent at ${this.n8nWebhookUrl}`);
            const axiosResp = await axios.post(
                this.n8nWebhookUrl,
                {
                    conversationId,
                    userId,
                    message: content,
                    channel: conversation.channel,
                    history: formattedHistory
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Internal-API-Key': this.internalApiKey // Securing internal service calls
                    },
                    timeout: 60000 // n8n Agents RAG can be slow parsing stuff
                }
            );
            n8nResponse = axiosResp.data;

        } catch (error) {
            this.logger.error(`Failed communicating with n8n Router: ${(error as any).message}`);

            // Fallback message so the user gets an error gracefully
            n8nResponse = {
                response: 'Lo siento, no pude procesar tu solicitud debido a una interrupción técnica. Intenta en breves instantes.',
                agentName: 'System',
                latencyMs: Date.now() - startTime
            };
        }

        // Parse sources safely (n8n might send stringified JSON or an array directly)
        let parsedSources = null;
        if (n8nResponse.sourcesCited) {
            if (typeof n8nResponse.sourcesCited === 'string') {
                try { parsedSources = JSON.parse(n8nResponse.sourcesCited); } catch (e) { }
            } else {
                parsedSources = n8nResponse.sourcesCited;
            }
        }

        // 5. Save Assistant Message
        const assistantMessage = await this.prisma.message.create({
            data: {
                conversationId,
                role: MessageRole.assistant,
                content: n8nResponse.response || n8nResponse.text || n8nResponse.output || 'Respuesta vacía',
                tokenCount: n8nResponse.tokenCount || 0,
                latencyMs: n8nResponse.latencyMs || Date.now() - startTime,
                modelUsed: n8nResponse.modelUsed || 'unknown',
                costUsd: n8nResponse.costUsd || 0,
                sourcesCited: parsedSources,
            }
        });

        // 6. Update Conversation state
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                updatedAt: new Date(),
                currentAgent: n8nResponse.agentName || 'RouterAgent'
            }
        });

        // Construct response mapped cleanly
        return {
            id: assistantMessage.id,
            conversationId,
            role: assistantMessage.role,
            content: assistantMessage.content,
            agentName: n8nResponse.agentName,
            sourcesCited: assistantMessage.sourcesCited,
            createdAt: assistantMessage.createdAt
        };
    }

    async closeConversation(id: string, userId: string) {
        const conversation = await this.prisma.conversation.findUnique({ where: { id, userId } });
        if (!conversation) throw new NotFoundException('Conversation not found');

        return this.prisma.conversation.update({
            where: { id },
            data: { status: ConversationStatus.closed }
        });
    }
}
