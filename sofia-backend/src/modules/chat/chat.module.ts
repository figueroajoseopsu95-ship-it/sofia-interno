import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [JwtModule], // Gateway needs JWT verify explicitly bypassing generic Guards normally used in REST
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService], // Used by Google Chat
})
export class ChatModule { }
