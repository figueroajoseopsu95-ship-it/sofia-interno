import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ChannelType {
    WEB = 'web',
    MOBILE = 'mobile',
    GOOGLE_CHAT = 'google_chat',
}

export class CreateConversationDto {
    @ApiPropertyOptional({ example: 'Ayuda sobre tarjeta de crédito' })
    @IsString()
    @IsOptional()
    title?: string;
}
