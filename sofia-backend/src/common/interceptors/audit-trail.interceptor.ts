import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const { method, originalUrl, ip } = request;
        const userAgent = request.get('user-agent') || 'Unknown';
        const correlationId = request.headers['x-correlation-id'] || 'system-generated';

        return next.handle().pipe(
            tap(async () => {
                // En un caso real esto ignoraria peticiones GET de alta frecuencia
                if (method !== 'GET') {
                    try {
                        await this.prisma.auditLog.create({
                            data: {
                                correlationId,
                                action: `${method} ${originalUrl}`,
                                userId: user?.id || null,
                                ipAddress: ip,
                                userAgent,
                                result: 'success',
                            },
                        });
                    } catch (error) {
                        console.error('Failed to write audit log', error);
                    }
                }
            }),
        );
    }
}
