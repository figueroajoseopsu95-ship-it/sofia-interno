import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
    @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description: 'Collection ID to ingest into' })
    @IsUUID()
    @IsNotEmpty()
    collectionId: string;

    @ApiPropertyOptional({ example: 'Manual de Políticas de Crédito 2026' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: '{"department": "Finanzas", "confidential": true}' })
    @IsString()
    @IsOptional()
    metadata?: string; // Expecting stringified JSON via multipart form data
}
