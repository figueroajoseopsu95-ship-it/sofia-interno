import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Temporary enum if we want strict validation, prisma uses String for these fields actually
// but mapping them is helpful
export enum ChunkStrategy {
    SEMANTIC = 'semantic',
    RECURSIVE = 'recursive',
    BY_PAGE = 'by_page',
    FIXED_SIZE = 'fixed_size',
}

export class CreateCollectionDto {
    @ApiProperty({ example: 'Atencion al Cliente' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'ATC' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional({ example: 'Manuales y Guias' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    @IsString()
    @IsOptional()
    departmentId?: string;

    @ApiPropertyOptional({ default: 'text-embedding-3-small' })
    @IsString()
    @IsOptional()
    embeddingModel?: string;

    @ApiPropertyOptional({ enum: ChunkStrategy, default: ChunkStrategy.SEMANTIC })
    @IsEnum(ChunkStrategy)
    @IsOptional()
    chunkStrategy?: ChunkStrategy;

    @ApiPropertyOptional({ default: 512 })
    @IsInt()
    @IsOptional()
    chunkSize?: number;

    @ApiPropertyOptional({ default: 50 })
    @IsInt()
    @IsOptional()
    chunkOverlap?: number;
}
