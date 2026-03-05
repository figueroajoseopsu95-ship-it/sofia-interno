import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interceptor that tracks data mutations (POST, PUT, PATCH, DELETE) automatically
 * and pushes an AuditLog so developers don't have to manually write log statements everywhere.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req: Request = context.switchToHttp().getRequest();
        const method = req.method;

        // Only audit mutations automatically by default
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const start = Date.now();

            return next.handle().pipe(
                tap({
                    next: () => this.logRequest(req, 'success', Date.now() - start),
                    error: () => this.logRequest(req, 'failed', Date.now() - start),
                }),
            );
        }

        return next.handle();
    }

    private logRequest(req: any, result: string, duration: number) {
        const userId = req.user?.id || req.user?.sub || null;
        let action = `${req.method}_${req.route?.path || req.originalUrl}`.toUpperCase().replace(/\//g, '_');

        // Fallbacks and string cleaning
        action = action.substring(0, 100);

        this.auditService.log({
            correlationId: req.headers['x-correlation-id'] as string || uuidv4(),
            userId,
            action,
            resourceType: 'API_ENDPOINT',
            details: {
                body: process.env.NODE_ENV === 'development' ? this.sanitizeBody(req.body) : 'Redacted in non-dev',
                query: req.query,
                durationMs: duration
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            result
        });
    }

    private sanitizeBody(body: any) {
        if (!body) return null;
        const clean = { ...body };
        // Redact passwords or secrets explicitly
        if (clean.password) clean.password = '***';
        if (clean.token) clean.token = '***';
        return clean;
    }
}
