import { IsString, IsNotEmpty, IsNumber, Min, Max, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackCategory {
    INCORRECT_INFO = 'incorrect_info',
    OUTDATED = 'outdated',
    INCOMPLETE = 'incomplete',
    OFF_TOPIC = 'off_topic',
    HELPFUL = 'helpful'
}

export class CreateFeedbackDto {
    @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    @IsUUID()
    @IsNotEmpty()
    messageId: string;

    @ApiProperty({ example: 5, description: 'Rating 1 to 5' })
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @ApiPropertyOptional({ example: 'La política cambió la semana pasada y el asistente no lo sabe.' })
    @IsString()
    @IsOptional()
    comment?: string;

    @ApiPropertyOptional({ enum: FeedbackCategory })
    @IsEnum(FeedbackCategory)
    @IsOptional()
    category?: FeedbackCategory;
}
