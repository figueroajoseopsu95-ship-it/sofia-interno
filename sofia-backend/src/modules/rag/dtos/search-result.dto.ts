import { ApiProperty } from '@nestjs/swagger';

export class ChunkResultDto {
    @ApiProperty() chunkId: string;
    @ApiProperty() documentId: string;
    @ApiProperty() documentTitle: string;
    @ApiProperty() content: string;
    @ApiProperty() score: number;
    @ApiProperty({ type: [Number], required: false }) pageNumbers?: number[];
    @ApiProperty({ required: false }) sectionTitle?: string;
    @ApiProperty({ required: false }) url?: string; // Optional deep link
}

export class SearchResultDto {
    @ApiProperty({ type: [ChunkResultDto] })
    chunks: ChunkResultDto[];

    @ApiProperty()
    totalFound: number;

    @ApiProperty()
    searchTimeMs: number;
}
