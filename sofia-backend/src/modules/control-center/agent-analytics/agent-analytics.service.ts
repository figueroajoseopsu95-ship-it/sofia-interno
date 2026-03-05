import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@Injectable()
export class AgentAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getAgentsList() {
        // We group logs by agentName to calculate aggregate stats
        const stats = await this.prisma.agentExecutionLog.groupBy({
            by: ['agentName'],
            _count: { id: true },
            _avg: { latencyMs: true },
            _sum: { totalTokens: true }
        });

        const successCounts = await this.prisma.agentExecutionLog.groupBy({
            by: ['agentName', 'status'],
            _count: { id: true },
            where: { status: 'success' }
        });

        const result = stats.map(stat => {
            const successStat = successCounts.find(s => s.agentName === stat.agentName);
            const totalExecutions = stat._count.id;
            const successExecutions = successStat ? successStat._count.id : 0;

            return {
                agentName: stat.agentName,
                totalExecutions,
                avgLatencyMs: Math.round(stat._avg.latencyMs || 0),
                totalTokens: stat._sum.totalTokens || 0,
                successRate: totalExecutions > 0 ? (successExecutions / totalExecutions) * 100 : 0
            };
        }).sort((a, b) => b.totalExecutions - a.totalExecutions).slice(0, 10);

        return result;
    }

    async getAgentDetail(name: string) {
        const agentStats = await this.prisma.agentExecutionLog.aggregate({
            where: { agentName: name },
            _count: { id: true },
            _avg: { latencyMs: true },
            _sum: { totalTokens: true, costUsd: true }
        });

        if (agentStats._count.id === 0) {
            throw new NotFoundException(`Agent ${name} not found or has no executions.`);
        }

        // Example of historical metric: executions per day for the last 7 days
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const executionsHistory = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(id) as count
      FROM audit.agent_execution_logs
      WHERE agent_name = ${name} AND created_at >= ${last7Days}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

        return {
            agentName: name,
            ...agentStats,
            costUsd: Number(agentStats._sum.costUsd || 0),
            history: executionsHistory
        };
    }

    async getAgentExecutions(name: string, pagination: PaginationQueryDto) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;

        const [total, executions] = await this.prisma.$transaction([
            this.prisma.agentExecutionLog.count({ where: { agentName: name } }),
            this.prisma.agentExecutionLog.findMany({
                where: { agentName: name },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: executions,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
}
