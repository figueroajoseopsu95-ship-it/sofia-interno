import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class OverviewService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalConversationsToday,
            totalMessages,
            activeUsers,
            agentExecutions
        ] = await Promise.all([
            this.prisma.conversation.count({
                where: { createdAt: { gte: today } }
            }),
            this.prisma.message.count(),
            this.prisma.user.count({
                where: { lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Active in last 30 days
            }),
            this.prisma.agentExecutionLog.aggregate({
                _avg: { latencyMs: true },
                _sum: { totalTokens: true, costUsd: true }
            })
        ]);

        const feedbackStats = await this.prisma.feedback.groupBy({
            by: ['rating'],
            _count: { id: true },
        });

        return {
            totalConversationsToday,
            totalMessages,
            activeUsers,
            avgLatencyMs: Math.round(agentExecutions._avg.latencyMs || 0),
            totalTokens: agentExecutions._sum.totalTokens || 0,
            totalCostUsd: Number(agentExecutions._sum.costUsd || 0),
            avgFeedbackScore: (() => {
                const total = feedbackStats.reduce((s: number, b: any) => s + b._count.id, 0);
                const pos = feedbackStats.find((b: any) => b.rating === 'positive')?._count.id || 0;
                return total > 0 ? Number((pos / total).toFixed(2)) : 0;
            })()
        };
    }

    async getActivityFeed() {
        // Get latest activities to form a feed
        const [recentConvos, recentFeedback, recentExecutions] = await Promise.all([
            this.prisma.conversation.findMany({
                take: 15,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true, email: true } } }
            }),
            this.prisma.feedback.findMany({
                take: 15,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } } }
            }),
            this.prisma.agentExecutionLog.findMany({
                take: 20,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        // Format them into a generic activity structure
        const feed = [
            ...recentConvos.map(c => ({
                id: c.id,
                type: 'conversation_started',
                description: `${c.user.firstName} ${c.user.lastName} inició un chat en ${c.channel}`,
                timestamp: c.createdAt
            })),
            ...recentFeedback.map(f => ({
                id: f.id,
                type: 'feedback_submitted',
                description: `${f.user.firstName} ${f.user.lastName} calificó con ${f.rating} estrellas`,
                timestamp: f.createdAt
            })),
            ...recentExecutions.map(e => ({
                id: e.id,
                type: 'agent_executed',
                description: `Agente ${e.agentName} ejecutado (${e.status})`,
                timestamp: e.createdAt
            }))
        ];

        // Sort globally by timestamp
        return feed.sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0)).slice(0, 50);
    }

    async getSystemHealth() {
        // Mocking system health for now. In a real scenario, you'd ping the DB, Redis, and n8n API.
        let dbStatus = 'healthy';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch {
            dbStatus = 'unhealthy';
        }

        return {
            postgres: dbStatus,
            redis: 'healthy', // Assuming redis is up since CacheModule didn't crash
            n8n: 'healthy', // Can be verified by hitting the webhook URL via axios
            lastChecked: new Date()
        };
    }
}
