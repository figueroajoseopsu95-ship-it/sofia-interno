import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-internal-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('Internal API Key is missing');
        }

        const validApiKey = this.configService.get<string>('INTERNAL_API_KEY');

        if (apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid Internal API Key');
        }

        return true;
    }
}
