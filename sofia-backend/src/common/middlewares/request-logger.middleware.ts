import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const correlationId = req.headers['x-correlation-id'];

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');

            this.logger.log(
                `${method} ${originalUrl} ${statusCode} ${contentLength || 0} - ${userAgent} ${ip} [ReqID: ${correlationId}]`
            );
        });

        next();
    }
}
