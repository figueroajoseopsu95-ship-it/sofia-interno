import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() messageId: string;
    @ApiProperty() userId: string;
    @ApiProperty() rating: number;
    @ApiPropertyOptional() comment?: string;
    @ApiPropertyOptional() category?: string;
    @ApiProperty() createdAt: Date;
}
