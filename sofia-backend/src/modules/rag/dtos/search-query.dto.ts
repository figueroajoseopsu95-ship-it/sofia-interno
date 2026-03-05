import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
    @ApiProperty({ example: 'Como apruebo un credito a empresa agropecuaria?' })
    @IsString()
    @IsNotEmpty()
    query: string;

    @ApiPropertyOptional({ example: 'ATC' })
    @IsString()
    @IsOptional()
    collectionCode?: string;

    @ApiPropertyOptional({ default: 5, description: 'Number of chunks to return' })
    @IsNumber()
    @Min(1)
    @Max(20)
    @IsOptional()
    topK?: number = 5;

    @ApiPropertyOptional({ default: 0.7, description: 'Minimum similarity score' })
    @IsNumber()
    @Min(0)
    @Max(1)
    @IsOptional()
    threshold?: number = 0.7;

    @ApiPropertyOptional({ default: true, description: 'Whether to use Hybrid search (Vector + Fulltext RRF) or just Vector' })
    @IsBoolean()
    @IsOptional()
    useHybrid?: boolean = true;
}
