import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';

@Global() // Making it global so AuditService is easily reachable anywhere
@Module({
    controllers: [AuditController],
    providers: [
        AuditService,
        {
            provide: APP_INTERCEPTOR, // Registering globally so ALL requests pass through it automatically
            useClass: AuditInterceptor,
        }
    ],
    exports: [AuditService],
})
export class AuditModule { }
