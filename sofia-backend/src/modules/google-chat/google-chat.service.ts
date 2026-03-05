import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChatService } from '../chat/chat.service';
import { GoogleChatAdapter } from './google-chat.adapter';
import { GoogleChatEventDto } from './dtos/google-chat-event.dto';
import { GoogleChatResponseDto } from './dtos/google-chat-response.dto';
import { ChannelType } from '../chat/dtos/create-conversation.dto';

@Injectable()
export class GoogleChatService {
    private readonly logger = new Logger(GoogleChatService.name);

    constructor(
        private prisma: PrismaService,
        private chatService: ChatService,
        private adapter: GoogleChatAdapter,
    ) { }

    async handleWebhook(event: GoogleChatEventDto): Promise<GoogleChatResponseDto> {
        this.logger.debug(`Received Google Chat Event: ${event.type}`);

        switch (event.type) {
            case 'ADDED_TO_SPACE':
                return { text: '¡Hola! Soy SOFIA, tu asistente IA de Banesco. Escríbeme cualquier consulta operativa que tengas.' };

            case 'MESSAGE':
                return this.handleMessage(event);

            case 'REMOVED_FROM_SPACE':
                this.logger.log(`Removed from space ${event.space.name}`);
                return {};

            default:
                return {};
        }
    }

    private async handleMessage(event: GoogleChatEventDto): Promise<GoogleChatResponseDto> {
        const senderEmail = event.user.email;
        const googleChatId = event.user.name; // user.name in GChat API is actually the distinct users/1234 ID
        const content = event.message.text?.trim();

        if (!content) return {};

        // 1. Identify User in our DB
        let user = await this.prisma.user.findFirst({
            // GSuite emails usually match company emails. Better if we map googleChatId 
            where: {
                OR: [
                    { googleChatId },
                    { email: senderEmail }
                ]
            }
        });

        if (!user) {
            return { text: 'No estás registrado en el sistema administrativo de SOFIA. Por favor contacta a soporte corporativo.' };
        }

        // Auto-update their googleChatId if they reached via email matching but didn't have ID set
        if (!user.googleChatId) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { googleChatId }
            });
        }

        // 2. Find or Create conversation specifically for G-Chat Channel
        // We look for any active conversation under this channel
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                userId: user.id,
                channel: ChannelType.GOOGLE_CHAT,
                status: 'active'
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!conversation) {
            conversation = await this.chatService.createConversation(user.id, ChannelType.GOOGLE_CHAT, 'Chat de Google Workspace');
        }

        // 3. Process the message through our central nervous system (ChatService -> n8n Router -> LLM)
        try {
            const assistantReply = await this.chatService.sendMessage(conversation.id, user.id, content);

            // 4. Transform response back into Google Chat rich format
            return this.adapter.formatOutgoing(assistantReply as any);

        } catch (error) {
            this.logger.error(`Error processing GChat message: ${(error as any).message}`);
            return { text: 'Hubo un error de conexión procesando tu consulta. Intenta nuevamente.' };
        }
    }
}
