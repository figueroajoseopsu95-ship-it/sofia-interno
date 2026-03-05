import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class TokenAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getTokensConsumption() {
        // Total accumulated tokens
        const totalAccumulated = await this.prisma.agentExecutionLog.aggregate({
            _sum: { totalTokens: true, promptTokens: true, completionTokens: true }
        });

        // Consumption by Agent
        const byAgent = await this.prisma.agentExecutionLog.groupBy({
            by: ['agentName'],
            _sum: { totalTokens: true, promptTokens: true, completionTokens: true }
        });

        // Consumption by Day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const byDayRaw = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as date, 
             SUM(total_tokens) as "totalTokens",
             SUM(prompt_tokens) as "promptTokens",
             SUM(completion_tokens) as "completionTokens"
      FROM audit.agent_execution_logs
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

        return {
            accumulated: {
                total: totalAccumulated._sum.totalTokens || 0,
                prompt: totalAccumulated._sum.promptTokens || 0,
                completion: totalAccumulated._sum.completionTokens || 0
            },
            byAgent: byAgent.map(a => ({
                agentName: a.agentName,
                total: a._sum.totalTokens || 0,
                prompt: a._sum.promptTokens || 0,
                completion: a._sum.completionTokens || 0
            })),
            byDay: byDayRaw
        };
    }

    async getCosts() {
        const byAgent = await this.prisma.agentExecutionLog.groupBy({
            by: ['agentName'],
            _sum: { costUsd: true }
        });

        const byModel = await this.prisma.agentExecutionLog.groupBy({
            by: ['llmModel'],
            _sum: { costUsd: true }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const byDayRaw = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as date, 
             SUM(cost_usd) as "costUsd"
      FROM audit.agent_execution_logs
      WHERE created_at >= ${thirtyDaysAgo} AND cost_usd IS NOT NULL
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

        return {
            totalAccumulated: (byModel.reduce((acc, curr) => acc + Number(curr._sum.costUsd || 0), 0)).toFixed(4),
            byAgent: byAgent.map(a => ({
                agentName: a.agentName,
                costUsd: Number(a._sum.costUsd || 0)
            })),
            byModel: byModel.map(m => ({
                model: m.llmModel || 'Unknown',
                costUsd: Number(m._sum.costUsd || 0)
            })),
            byDay: byDayRaw
        };
    }

    async getPerformance() {
        // Normally P50, P95, P99 require percentile functions in Postgres.
        // PERCENTILE_CONT is available in newer PG versions.
        const performanceRaw = await this.prisma.$queryRaw`
      SELECT 
        agent_name as "agentName",
        COUNT(id) as "totalExecutions",
        AVG(latency_ms) as "avgLatency",
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) as "p50",
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as "p95",
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as "p99"
      FROM audit.agent_execution_logs
      WHERE latency_ms IS NOT NULL
      GROUP BY agent_name
      ORDER BY "totalExecutions" DESC
    `;

        return performanceRaw;
    }
}
