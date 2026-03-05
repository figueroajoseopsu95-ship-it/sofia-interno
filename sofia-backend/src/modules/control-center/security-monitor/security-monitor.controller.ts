import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityMonitorService } from './security-monitor.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@ApiTags('Admin Control Center - Security Monitor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/security')
export class SecurityMonitorController {
    constructor(private readonly securityMonitorService: SecurityMonitorService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Get overview of security metrics (failed logins, blocks, events)' })
    async getOverview() {
        return this.securityMonitorService.getOverview();
    }

    @Get('alerts')
    @ApiOperation({ summary: 'List security alerts/events mapped by severity' })
    async getAlerts(
        @Query() pagination: PaginationQueryDto,
        @Query('severity') severity?: string
    ) {
        return this.securityMonitorService.getAlerts(pagination, severity);
    }
}
