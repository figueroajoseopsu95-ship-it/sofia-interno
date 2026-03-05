import { ApiProperty } from '@nestjs/swagger';

export class EnrichedDocumentDto {
    @ApiProperty() documentId: string;
    @ApiProperty() title: string;
    @ApiProperty() collectionName: string;
    @ApiProperty() snippet: string;
    @ApiProperty() score: number;
    @ApiProperty({ type: [Number], required: false }) pageNumbers?: number[];
}

export class SearchResponseDto {
    @ApiProperty({ example: 'Requisitos para aperturar cuenta juridica' })
    query: string;

    @ApiProperty({ type: [EnrichedDocumentDto] })
    results: EnrichedDocumentDto[];

    @ApiProperty()
    searchTimeMs: number;
}
