import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('RequestTracker');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const correlationId = request.headers['x-correlation-id'];
        const { method, originalUrl } = request;

        const now = Date.now();
        this.logger.log(`[ReqID: ${correlationId}] Incoming -> ${method} ${originalUrl}`);

        return next.handle().pipe(
            tap(() => {
                const delay = Date.now() - now;
                this.logger.log(`[ReqID: ${correlationId}] Outgoing <- ${method} ${originalUrl} +${delay}ms`);
            }),
        );
    }
}
