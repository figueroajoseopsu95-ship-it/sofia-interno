import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { InternalService } from './internal.service';

// Modules required by InternalService to delegate actions
import { RagModule } from '../rag/rag.module';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { GoogleChatModule } from '../google-chat/google-chat.module';

@Module({
    imports: [RagModule, UsersModule, ChatModule, GoogleChatModule],
    controllers: [InternalController],
    providers: [InternalService],
})
export class InternalModule { }
