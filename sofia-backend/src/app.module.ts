import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './database/prisma.module';

// Import real modules instead of dummy
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RagModule } from './modules/rag/rag.module';
import { SearchModule } from './modules/search/search.module';
import { GoogleChatModule } from './modules/google-chat/google-chat.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

import { InternalModule } from './modules/internal/internal.module';
import { AuditModule } from './modules/audit/audit.module';
import { ControlCenterModule } from './modules/control-center/control-center.module';

// --- DUMMY MODULES TO BE REPLACED EVENTUALLY ---
@Module({}) export class AgentsModule { }

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
        }),
        ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
        LoggerModule.forRoot({
            pinoHttp: {
                transport: process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty', options: { singleLine: true } }
                    : undefined,
            },
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get<string>('REDIS_HOST', 'localhost'),
                port: configService.get<number>('REDIS_PORT', 6379),
                password: configService.get<string>('REDIS_PASSWORD'),
                ttl: 60000,
            }),
            inject: [ConfigService],
        }),
        PrismaModule,
        // Registros
        AuthModule,
        UsersModule,
        DepartmentsModule,
        ChatModule,
        AgentsModule,
        KnowledgeModule,
        DocumentsModule,
        RagModule,
        SearchModule,
        GoogleChatModule,
        FeedbackModule,
        InternalModule,
        AuditModule,
        ControlCenterModule,
    ],
})
export class AppModule { }
