import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OverviewService } from './overview.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Control Center - Overview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/overview')
export class OverviewController {
    constructor(private readonly overviewService: OverviewService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get main KPI statistics for the dashboard' })
    async getStats() {
        return this.overviewService.getStats();
    }

    @Get('activity-feed')
    @ApiOperation({ summary: 'Get latest system activity' })
    async getActivityFeed() {
        return this.overviewService.getActivityFeed();
    }

    @Get('system-health')
    @ApiOperation({ summary: 'Check health status of integrations (PG, Redis, n8n)' })
    async getSystemHealth() {
        return this.overviewService.getSystemHealth();
    }
}
