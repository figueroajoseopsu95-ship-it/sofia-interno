import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@Injectable()
export class SecurityMonitorService {
    constructor(private prisma: PrismaService) { }

    async getOverview() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            failedLogins,
            blockedUsers,
            totalSecurityEvents,
            highSeverityEvents
        ] = await Promise.all([
            this.prisma.auditLog.count({
                where: { action: 'POST_AUTH_LOGIN', result: 'failed', createdAt: { gte: thirtyDaysAgo } }
            }),
            this.prisma.user.count({
                where: { status: 'blocked' }
            }),
            this.prisma.securityEvent.count({
                where: { createdAt: { gte: thirtyDaysAgo } }
            }),
            this.prisma.securityEvent.count({
                where: { severity: 'high', createdAt: { gte: thirtyDaysAgo } }
            })
        ]);

        return {
            last30Days: {
                failedLogins,
                totalSecurityEvents,
                highSeverityEvents
            },
            currentStatus: {
                blockedUsers
            }
        };
    }

    async getAlerts(pagination: PaginationQueryDto, severity?: string) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (severity) where.severity = severity;

        const [total, alerts] = await this.prisma.$transaction([
            this.prisma.securityEvent.count({ where }),
            this.prisma.securityEvent.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            })
        ]);

        return {
            data: alerts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
}
