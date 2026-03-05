import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const correlationId = request.headers['x-correlation-id'] || 'unknown';

        const errorResponse = {
            success: false,
            error: {
                code: exception instanceof HttpException ? exception.name : 'INTERNAL_SERVER_ERROR',
                message: exception instanceof HttpException ? exception.message : 'Internal server error',
                details: exception instanceof HttpException ? exception.getResponse() : null,
            },
            timestamp: new Date().toISOString(),
            correlationId
        };

        // Logging the error
        this.logger.error(`[ReqID: ${correlationId}] ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));

        httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
    }
}
