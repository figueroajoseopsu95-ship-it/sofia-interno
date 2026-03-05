import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async handleConnection(client: Socket) {
        try {
            // Very basic JWT validation on Hanshake
            const token = client.handshake.auth.token || client.handshake.headers['authorization']?.split(' ')[1];
            if (!token) throw new Error('No token provided');

            const jwtSecret = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret: jwtSecret });

            client.data.user = payload;
            this.logger.log(`Client connected via WS: ${client.id} (User: ${payload.sub})`);
        } catch (error) {
            this.logger.warn(`Disconnected unauthorized client WS: ${client.id}`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
        client.join(`conversation:${data.conversationId}`);
        this.logger.debug(`Client ${client.id} joined room conversation:${data.conversationId}`);
        return { status: 'joined', conversationId: data.conversationId };
    }

    @SubscribeMessage('send_message')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string, content: string }
    ) {
        const userId = client.data.user.sub;

        // Broadcast "typing" artificially immediately
        client.to(`conversation:${payload.conversationId}`).emit('typing', { userId, isTyping: true });

        try {
            // Heavy lifting logic of invoking n8n in ChatService
            const response = await this.chatService.sendMessage(payload.conversationId, userId, payload.content);

            // Emit the final message back to the room
            this.server.to(`conversation:${payload.conversationId}`).emit('new_message', response);
            this.server.to(`conversation:${payload.conversationId}`).emit('typing', { userId, isTyping: false });

            return { status: 'success' };
        } catch (error) {
            this.logger.error(`WS Send Message Error: ${(error as any).message}`);
            client.emit('error', { message: 'Failed to process message' });
            this.server.to(`conversation:${payload.conversationId}`).emit('typing', { userId, isTyping: false });
            return { status: 'error' };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string, isTyping: boolean }) {
        client.to(`conversation:${data.conversationId}`).emit('typing', {
            userId: client.data.user.sub,
            isTyping: data.isTyping
        });
    }
}
