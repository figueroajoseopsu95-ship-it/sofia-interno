import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ example: 'Como apruebo un credito a empresa?' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
