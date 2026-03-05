import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParserService } from './parser.service';
import { OcrService } from './ocr.service';
import { ChunkingService } from '../knowledge/chunking.service';
import { EmbeddingService } from '../knowledge/embedding.service';
import { UploadDocumentDto } from './dtos/upload-document.dto';
import { DocumentFilterDto } from './dtos/document-filter.dto';
import { FileType, DocumentStatus, JobType, JobStatus, ChunkType } from '@prisma/client';
import { ChunkStrategy } from '../knowledge/dtos/create-collection.dto';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);

    constructor(
        private prisma: PrismaService,
        private parserService: ParserService,
        private ocrService: OcrService,
        private chunkingService: ChunkingService,
        private embeddingService: EmbeddingService,
    ) { }

    async upload(file: Express.Multer.File, uploadDto: UploadDocumentDto) {
        // 1. Validate collection exists
        const collection = await this.prisma.collection.findUnique({
            where: { id: uploadDto.collectionId }
        });

        if (!collection) {
            throw new NotFoundException(`Collection ${uploadDto.collectionId} not found`);
        }

        // 2. Validate parsing type
        const fileTypeStr = file.originalname.split('.').pop()?.toLowerCase();
        const validTypes = ['pdf', 'docx', 'xlsx', 'html', 'txt', 'pptx'];
        if (!validTypes.includes(fileTypeStr || '')) {
            throw new BadRequestException(`File type ${fileTypeStr} not supported`);
        }

        const fileType = fileTypeStr as FileType;
        let md = {};
        if (uploadDto.metadata) {
            try { md = JSON.parse(uploadDto.metadata); } catch (e) { }
        }

        // Calculate Hash
        const fileBuffer = fs.readFileSync(file.path);
        const contentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // 3. Register document in DB
        const document = await this.prisma.document.create({
            data: {
                collectionId: collection.id,
                title: uploadDto.title || file.originalname,
                originalFilename: file.originalname,
                fileType,
                fileSizeBytes: file.size,
                filePath: file.path,
                contentHash,
                status: DocumentStatus.pending,
                metadata: md,
            }
        });

        // 4. Create initial Ingestion Job
        const job = await this.prisma.ingestionJob.create({
            data: {
                documentId: document.id,
                jobType: JobType.full_ingestion,
                status: JobStatus.queued,
            }
        });

        // Asynchronously trigger the pipeline (do not await so API returns quickly)
        this.processDocument(document.id, job.id).catch(e => {
            this.logger.error(`Background processing failed for document ${document.id}: ${e.message}`);
        });

        return {
            message: 'Document uploaded and ingestion queued successfully',
            documentId: document.id,
            jobId: job.id
        };
    }

    async processDocument(documentId: string, jobId: string) {
        const startTime = Date.now();
        let isOcrUsed = false;
        let ocrEngineUsed = null;

        try {
            // 1. Mark as processing
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: DocumentStatus.processing }
            });
            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: { status: JobStatus.processing, startedAt: new Date(), progressPercent: 10 }
            });

            const document = await this.prisma.document.findUnique({
                where: { id: documentId },
                include: { collection: true }
            });

            if (!document) throw new Error(`Document ${documentId} not found`);

            // 2. Extraccion Basica (Parser)
            this.logger.log(`Starting parsing for document: ${document.id}`);
            let parsed = await this.parserService.parseFile(document.filePath, document.fileType);

            // 3. OCR Check (solo para PDFs por ahora)
            if (document.fileType === 'pdf') {
                const needsOcr = await this.ocrService.detectOcrNeed(parsed.text.length, parsed.pages || 1);
                if (needsOcr) {
                    this.logger.log(`OCR required for Document ${document.id}. Text too sparse.`);
                    isOcrUsed = true;
                    try {
                        parsed.text = await this.ocrService.processWithGemini(document.filePath, 'application/pdf');
                        ocrEngineUsed = 'Gemini-2.5-Flash';
                    } catch (e) {
                        this.logger.warn(`Gemini OCR failed, falling back to Mistral for Document ${document.id}`);
                        parsed.text = await this.ocrService.processWithMistral(document.filePath);
                        ocrEngineUsed = 'Pixtral-12b';
                    }
                }
            }

            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: { progressPercent: 40 }
            });

            if (!parsed.text || parsed.text.trim().length === 0) {
                throw new Error('No text extracted from document after all pipelines');
            }

            // 4. Chunking
            this.logger.log(`Chunking document: ${document.id}`);
            const strategyStr = document.collection.chunkStrategy || 'semantic';
            // Converting Prisma string to local Enum for options payload
            const strategyEnum = strategyStr as unknown as ChunkStrategy;

            const chunks = this.chunkingService.chunkDocument(parsed.text, {
                strategy: strategyEnum,
                chunkSize: document.collection.chunkSize || 512,
                chunkOverlap: document.collection.chunkOverlap || 50
            });

            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: { progressPercent: 60, chunksCreated: chunks.length }
            });

            // 5. Embeddings (Batch to save time and rate limits)
            this.logger.log(`Generating embeddings for ${chunks.length} chunks`);
            const texts = chunks.map(c => c.content);
            const embeddingsMat = await this.embeddingService.generateBatchEmbeddings(texts, document.collection.embeddingModel);

            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: { progressPercent: 85 }
            });

            // 6. DB Storage - Delete old chunks if any (for reprocess)
            await this.prisma.documentChunk.deleteMany({ where: { documentId } });

            // Build data array for insertion
            const chunkDataEntries = chunks.map((chunk, index) => {
                // PGVector requires stringified arrays in raw queries or special handling, 
                // with Prisma direct create it usually expects array or specific object for vectors.
                // We will insert chunks via loop or direct data (depends on prisma-client vector extension support).
                return {
                    documentId,
                    chunkIndex: chunk.chunkIndex,
                    content: chunk.content,
                    contentLength: chunk.contentLength,
                    tokenCount: chunk.tokenCount,
                    pageNumbers: chunk.pageNumbers || [],
                    sectionTitle: chunk.sectionTitle || '',
                    chunkType: ChunkType.text,
                    embeddingModel: document.collection.embeddingModel
                };
            });

            // Insert chunks text properties
            // Since prisma natively doesn't easily do bulk inserts WITH vector fields at the moment in one go without raw,
            // we do it inside a loop using explicit raw if we want the vector index, but using standard create usually works 
            // with the `pgvector` Prisma extension if correctly formatted.
            // Easiest is to insert one by one or raw for the vector. Let's do standard with raw update for embeddings.

            let insertedCount = 0;
            for (let i = 0; i < chunks.length; i++) {
                const dbChunk = await this.prisma.documentChunk.create({
                    data: chunkDataEntries[i]
                });

                // Update the vector raw
                if (embeddingsMat[i]) {
                    const vectorString = `[${embeddingsMat[i].join(',')}]`;
                    await this.prisma.$executeRaw`
               UPDATE knowledge.document_chunks 
               SET embedding = ${vectorString}::vector 
               WHERE id = ${dbChunk.id}::uuid
            `;
                }
                insertedCount++;
            }

            // 7. Update Documents details
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    totalChunks: chunks.length,
                    totalPages: parsed.pages || 1,
                    ocrRequired: isOcrUsed,
                    ocrEngine: ocrEngineUsed,
                    status: DocumentStatus.indexed,
                    indexedAt: new Date()
                }
            });

            // Increment collection counter
            await this.prisma.$executeRaw`
        UPDATE knowledge.collections 
        SET document_count = document_count + 1 
        WHERE id = ${document.collectionId}::uuid
      `;

            // 8. Close job
            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: {
                    status: JobStatus.completed,
                    progressPercent: 100,
                    completedAt: new Date(),
                    processingTimeMs: Date.now() - startTime
                }
            });

            this.logger.log(`Document ${documentId} completely ingested in ${Date.now() - startTime}ms`);

        } catch (error) {
            this.logger.error(`Ingestion Pipeline Failed for Document ${documentId}: ${(error as any).message}`);

            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: DocumentStatus.error }
            });

            await this.prisma.ingestionJob.update({
                where: { id: jobId },
                data: {
                    status: JobStatus.failed,
                    errorMessage: (error as any).stack || (error as any).message,
                    completedAt: new Date(),
                    processingTimeMs: Date.now() - startTime
                }
            });
        }
    }

    async findAll(filterDto: DocumentFilterDto) {
        const { page = 1, limit = 10, collectionId, status, fileType } = filterDto;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (collectionId) where.collectionId = collectionId;
        if (status) where.status = status;
        if (fileType) where.fileType = fileType;

        const [total, documents] = await this.prisma.$transaction([
            this.prisma.document.count({ where }),
            this.prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { collection: { select: { id: true, name: true } } }
            })
        ]);

        return {
            data: documents,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: {
                collection: { select: { id: true, name: true, chunkStrategy: true } },
                chunks: {
                    select: { id: true, chunkIndex: true, content: true, tokenCount: true, pageNumbers: true, chunkType: true },
                    orderBy: { chunkIndex: 'asc' },
                    take: 100 // Returning max 100 to avoid giant payloads
                },
                jobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!document) throw new NotFoundException('Document not found');
        return document;
    }

    async archive(id: string) {
        await this.findById(id);

        // Decrement collection count conceptually, though we might still keep it around
        return this.prisma.document.update({
            where: { id },
            data: { status: DocumentStatus.archived }
        });
    }

    async reprocess(id: string) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        if (!document) throw new NotFoundException('Document not found');

        const job = await this.prisma.ingestionJob.create({
            data: {
                documentId: document.id,
                jobType: JobType.full_ingestion,
                status: JobStatus.queued,
            }
        });

        // Start background re-ingestion
        this.processDocument(document.id, job.id).catch(e => {
            this.logger.error(`Background reprocessing failed for document ${document.id}: ${e.message}`);
        });

        return {
            message: 'Reprocess triggered successfully',
            jobId: job.id
        };
    }
}
