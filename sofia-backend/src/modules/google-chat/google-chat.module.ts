import { Module } from '@nestjs/common';
import { GoogleChatController } from './google-chat.controller';
import { GoogleChatService } from './google-chat.service';
import { GoogleChatAdapter } from './google-chat.adapter';
import { ChatModule } from '../chat/chat.module'; // Core chatting logic dependency

@Module({
    imports: [ChatModule],
    controllers: [GoogleChatController],
    providers: [GoogleChatService, GoogleChatAdapter],
    exports: [GoogleChatService],
})
export class GoogleChatModule { }
