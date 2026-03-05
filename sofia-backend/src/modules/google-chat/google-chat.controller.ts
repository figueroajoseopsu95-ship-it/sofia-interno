import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleChatService } from './google-chat.service';
import { GoogleChatEventDto } from './dtos/google-chat-event.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Google Chat Webhook')
@Controller('google-chat')
export class GoogleChatController {
    constructor(private readonly googleChatService: GoogleChatService) { }

    @Post('webhook')
    @Public() // It must be public to receive GCP events. In production we verify the Bearer token issued by Google Chat.
    @HttpCode(200)
    @ApiOperation({ summary: 'Webhook entrypoint for Google Chat interactions' })
    async handleWebhook(@Body() event: GoogleChatEventDto) {
        // Note: To secure this properly, a middleware or guard verifying the 
        // "Authorization" header token against Google's public certificates is required globally.
        // For this scaffold, it accepts the payload.
        return this.googleChatService.handleWebhook(event);
    }
}
