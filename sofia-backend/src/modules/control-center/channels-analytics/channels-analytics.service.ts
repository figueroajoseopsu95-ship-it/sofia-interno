import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ChannelsAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getChannelsMetrics() {
        // Basic grouping by channel for conversations
        const conversationsByChannel = await this.prisma.conversation.groupBy({
            by: ['channel'],
            _count: { id: true }
        });

        // Getting average latency per channel requires joining conversation and messages
        const latencyByChannel = await this.prisma.$queryRaw`
      SELECT c.channel, 
             AVG(m.latency_ms) as "avgLatency",
             COUNT(m.id) as "totalMessages"
      FROM public.conversations c
      JOIN public.messages m ON c.id = m.conversation_id
      WHERE m.role = 'assistant' AND m.latency_ms IS NOT NULL
      GROUP BY c.channel
    `;

        // Satisfaction score by channel
        const satisfactionByChannel = await this.prisma.$queryRaw`
      SELECT c.channel, 
             AVG(f.rating) as "avgSatisfaction"
      FROM public.conversations c
      JOIN public.messages m ON c.id = m.conversation_id
      JOIN public.feedback f ON m.id = f.message_id
      GROUP BY c.channel
    `;

        // Merge results
        const results = conversationsByChannel.map(c => {
            const lat = (latencyByChannel as any[]).find(l => l.channel === c.channel);
            const sat = (satisfactionByChannel as any[]).find(s => s.channel === c.channel);

            return {
                channel: c.channel,
                totalConversations: c._count.id,
                totalMessages: lat ? Number(lat.totalMessages) : 0,
                avgLatencyMs: lat ? Math.round(Number(lat.avgLatency)) : 0,
                avgSatisfaction: sat ? Number(Number(sat.avgSatisfaction).toFixed(2)) : null
            };
        });

        return results;
    }
}
