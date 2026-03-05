import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { DocumentStatus, FileType } from '@prisma/client';

export class DocumentFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    collectionId?: string;

    @ApiPropertyOptional({ enum: DocumentStatus })
    @IsEnum(DocumentStatus)
    @IsOptional()
    status?: DocumentStatus;

    @ApiPropertyOptional({ enum: FileType })
    @IsEnum(FileType)
    @IsOptional()
    fileType?: FileType;
}
