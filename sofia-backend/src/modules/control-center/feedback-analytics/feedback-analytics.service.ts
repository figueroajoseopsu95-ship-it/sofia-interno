import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FeedbackAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getOverview() {
        const breakdown = await this.prisma.feedback.groupBy({
            by: ['rating'],
            _count: { id: true },
            orderBy: { rating: 'desc' }
        });

        const totalFeedbacks = breakdown.reduce((sum: number, b: any) => sum + b._count.id, 0);
        const positiveCount = breakdown.find((b: any) => b.rating === 'positive')?._count.id || 0;
        const averageScore = totalFeedbacks > 0 ? Number((positiveCount / totalFeedbacks).toFixed(2)) : 0;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const [currentCount, previousCount] = await Promise.all([
            this.prisma.feedback.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.feedback.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        ]);
        const trend = currentCount - previousCount;

        return {
            averageScore,
            totalFeedbacks,
            breakdown: breakdown.map(b => ({ rating: b.rating, count: b._count.id })),
            trend,
        };
    }

    async getTrends() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as date,
             AVG(rating) as "avgRating",
             COUNT(id) as "totalFeedbacks"
      FROM public.feedback
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;
    }

    async getFeedbackByAgent() {
        return this.prisma.$queryRaw`
      SELECT a.agent_name as "agentName", 
             AVG(f.rating) as "avgRating", 
             COUNT(f.id) as "feedbackCount"
      FROM public.feedback f
      JOIN public.messages m ON f.message_id = m.id
      JOIN audit.agent_execution_logs a ON m.conversation_id = a.conversation_id
      GROUP BY a.agent_name
      ORDER BY "avgRating" DESC
    `;
    }
}
