import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InternalSearchDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    query: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    collectionCode?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    topK?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    hybridWeight?: number;
}
