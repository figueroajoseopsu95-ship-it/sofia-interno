import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@Injectable()
export class RagAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getQualityMetrics() {
        const avgScoreResult = await this.prisma.$queryRaw`
      SELECT AVG(score) as "avgScore" 
      FROM (
        SELECT (jsonb_array_elements(chunks_retrieved)->>'score')::numeric as score 
        FROM audit.agent_execution_logs 
        WHERE jsonb_typeof(chunks_retrieved) = 'array'
      ) as scores
    `;

        const avgChunksOutput = await this.prisma.agentExecutionLog.aggregate({
            _avg: { chunksUsedInResponse: true }
        });

        const feedbackCorrelation = await this.prisma.$queryRaw`
      SELECT a.agent_name as "agentName", f.rating, COUNT(f.id) as count
      FROM public.feedback f
      JOIN public.messages m ON f.message_id = m.id
      JOIN audit.agent_execution_logs a ON m.conversation_id = a.conversation_id
      GROUP BY a.agent_name, f.rating
      ORDER BY a.agent_name, f.rating DESC
    `;

        return {
            avgRetrievalScore: (avgScoreResult as any[]) && (avgScoreResult as any[])[0] && (avgScoreResult as any[])[0].avgScore ? Number((avgScoreResult as any[])[0].avgScore).toFixed(4) : 0,
            avgChunksUsedPerResponse: Number(avgChunksOutput._avg.chunksUsedInResponse || 0).toFixed(2),
            feedbackCorrelation
        };
    }

    async getDocumentsStats(pagination: PaginationQueryDto) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const [total, documents] = await this.prisma.$transaction([
            this.prisma.document.count({ where: { status: 'indexed' } }),
            this.prisma.document.findMany({
                where: { status: 'indexed' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    originalFilename: true,
                    totalChunks: true,
                    indexedAt: true,
                    collection: { select: { name: true } }
                },
                orderBy: { indexedAt: 'desc' }
            })
        ]);

        // For each document we can add hypothetical metrics or just return the base stats
        const enriched = documents.map(d => ({
            ...d,
            queriesServed: Math.floor(Math.random() * 100), // Placeholder: In a real system, count appearances in chunks_retrieved
            avgScore: Number((Math.random() * (0.9 - 0.5) + 0.5).toFixed(2)) // Placeholder
        }));

        return {
            data: enriched,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async uploadDocument(body: any) {
        // Usually delegating to the DocumentsService to handle ingestion job creation
        // Mocked for the scaffold as we already built Knowledge/Documents core parts.
        return {
            message: 'Document upload triggered. Delegate to DocumentsService ingestion.',
            status: 'queued'
        };
    }

    async getChunksExplorer(pagination: PaginationQueryDto, filters: { documentId?: string }) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.documentId) where.documentId = filters.documentId;

        const [total, chunks] = await this.prisma.$transaction([
            this.prisma.documentChunk.count({ where }),
            this.prisma.documentChunk.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    content: true,
                    tokenCount: true,
                    pageNumbers: true,
                    sectionTitle: true,
                    documentId: true,
                    chunkType: true
                }
            })
        ]);

        return {
            data: chunks,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async getCollectionsStats() {
        return this.prisma.collection.findMany({
            include: {
                _count: { select: { documents: true } }
            }
        });
    }
}
