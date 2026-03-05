import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateFeedbackDto) {
        // 1. Verify Message Exists
        const message = await this.prisma.message.findUnique({
            where: { id: dto.messageId }
        });

        if (!message) throw new NotFoundException('Message not found');

        // Basic protection: Users can only rate assistant messages
        if (message.role !== 'assistant') {
            throw new ConflictException('You can only provide feedback for assistant replies');
        }

        // Checking if feedback already exists
        const existing = await this.prisma.feedback.findFirst({
            where: { messageId: dto.messageId, userId }
        });

        if (existing) {
            throw new ConflictException('You have already rated this message');
        }

        // 2. Create Feedback
        const feedback = await this.prisma.feedback.create({
            data: {
                messageId: dto.messageId,
                userId,
                rating: dto.rating as any,
                comment: dto.comment,
                category: dto.category
            }
        });

        // 3. Register Audit Log
        await this.prisma.auditLog.create({
            data: {
                correlationId: uuidv4(),
                userId,
                action: 'FEEDBACK_SUBMITTED',
                resourceId: feedback.id,
                details: { rating: dto.rating, category: dto.category }
            }
        });

        return feedback;
    }

    async getByUser(userId: string, pagination: PaginationQueryDto) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [total, feedbacks] = await this.prisma.$transaction([
            this.prisma.feedback.count({ where: { userId } }),
            this.prisma.feedback.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: feedbacks,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
