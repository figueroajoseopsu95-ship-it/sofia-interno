import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChunkStrategy } from './create-collection.dto';

export class ChunkOptionsDto {
    @ApiProperty({ enum: ChunkStrategy, default: ChunkStrategy.SEMANTIC })
    @IsEnum(ChunkStrategy)
    strategy: ChunkStrategy;

    @ApiProperty({ default: 512 })
    @IsInt()
    @Min(100)
    chunkSize: number;

    @ApiProperty({ default: 50 })
    @IsInt()
    @Min(0)
    chunkOverlap: number;
}
