import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto } from './dtos/create-audit-log.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private prisma: PrismaService) { }

    async log(data: CreateAuditLogDto) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    correlationId: data.correlationId,
                    userId: data.userId,
                    action: data.action,
                    resourceType: data.resourceType,
                    resourceId: data.resourceId,
                    details: data.details,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    result: data.result || 'success'
                }
            });
        } catch (error) {
            this.logger.error(`Failed to write AuditLog: ${(error as any).message}`);
        }
    }

    async findAuditLogs(pagination: PaginationQueryDto, filters?: any) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (filters?.action) whereClause.action = filters.action;
        if (filters?.userId) whereClause.userId = filters.userId;

        const [total, logs] = await this.prisma.$transaction([
            this.prisma.auditLog.count({ where: whereClause }),
            this.prisma.auditLog.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async findAgentLogs(pagination: PaginationQueryDto) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const [total, logs] = await this.prisma.$transaction([
            this.prisma.agentExecutionLog.count(),
            this.prisma.agentExecutionLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async findSecurityEvents(pagination: PaginationQueryDto) {
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;

        const [total, events] = await this.prisma.$transaction([
            this.prisma.securityEvent.count(),
            this.prisma.securityEvent.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: events,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
}
