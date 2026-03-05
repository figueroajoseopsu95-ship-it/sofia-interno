import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRequestDto {
    @ApiProperty({ example: 'Requisitos para aperturar cuenta juridica' })
    @IsString()
    @IsNotEmpty()
    query: string;

    @ApiPropertyOptional({ example: 'ATC' })
    @IsString()
    @IsOptional()
    collectionCode?: string;

    @ApiPropertyOptional({ default: 5 })
    @IsNumber()
    @Min(1)
    @Max(20)
    @IsOptional()
    maxResults?: number = 5;
}
