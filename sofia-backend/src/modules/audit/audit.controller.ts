import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Audit Logs (Admin Control Center)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get('logs')
    @Roles(UserRole.admin, UserRole.superadmin)
    @ApiOperation({ summary: 'List general system audit logs' })
    async getAuditLogs(@Query() pagination: PaginationQueryDto, @Query('action') action?: string, @Query('userId') userId?: string) {
        return this.auditService.findAuditLogs(pagination, { action, userId });
    }

    @Get('agents')
    @Roles(UserRole.admin, UserRole.superadmin)
    @ApiOperation({ summary: 'List n8n agent execution logs' })
    async getAgentLogs(@Query() pagination: PaginationQueryDto) {
        return this.auditService.findAgentLogs(pagination);
    }

    @Get('security')
    @Roles(UserRole.admin, UserRole.superadmin)
    @ApiOperation({ summary: 'List high-alert security events' })
    async getSecurityEvents(@Query() pagination: PaginationQueryDto) {
        return this.auditService.findSecurityEvents(pagination);
    }
}
