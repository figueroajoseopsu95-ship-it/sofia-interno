import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dtos/upload-document.dto';
import { DocumentFilterDto } from './dtos/document-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Helper for local disk uploads
const storage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4() + extname(file.originalname);
        cb(null, `${uniqueSuffix}`);
    }
});

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Upload and trigger ingestion pipeline' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                collectionId: { type: 'string', format: 'uuid' },
                title: { type: 'string', nullable: true },
                metadata: { type: 'string', nullable: true },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', { storage }))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadDto: UploadDocumentDto,
    ) {
        if (!file) throw new BadRequestException('File is required');
        return this.documentsService.upload(file, uploadDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all documents with pagination and filters' })
    @ApiResponse({ status: 200, description: 'Return list of documents' })
    async findAll(@Query() filterDto: DocumentFilterDto) {
        return this.documentsService.findAll(filterDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document details including chunks and job history' })
    @ApiResponse({ status: 200, description: 'Return document details' })
    async findById(@Param('id') id: string) {
        return this.documentsService.findById(id);
    }

    @Delete(':id')
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Soft delete / Archive a document' })
    @ApiResponse({ status: 200, description: 'Document archived successfully' })
    async archive(@Param('id') id: string) {
        return this.documentsService.archive(id);
    }

    @Post(':id/reprocess')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Re-ingest a document (useful if OCR/Chunks configurations changed)' })
    @ApiResponse({ status: 200, description: 'Reprocess queued' })
    async reprocess(@Param('id') id: string) {
        return this.documentsService.reprocess(id);
    }
}
