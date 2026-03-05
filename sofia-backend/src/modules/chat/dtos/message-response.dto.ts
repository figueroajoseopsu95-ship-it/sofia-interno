import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageSourceDto {
    @ApiProperty() documentId: string;
    @ApiProperty() title: string;
    @ApiProperty() chunkId?: string;
    @ApiProperty({ required: false }) pageNumbers?: number[];
}

export class MessageResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() conversationId: string;
    @ApiProperty() role: string;
    @ApiProperty() content: string;

    @ApiPropertyOptional()
    agentName?: string;

    @ApiPropertyOptional({ type: [MessageSourceDto] })
    sourcesCited?: MessageSourceDto[];

    @ApiProperty() createdAt: Date;
}
