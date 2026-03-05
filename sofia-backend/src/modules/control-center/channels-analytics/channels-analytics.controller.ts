import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsAnalyticsService } from './channels-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Control Center - Channels Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/analytics/channels')
export class ChannelsAnalyticsController {
    constructor(private readonly channelsAnalyticsService: ChannelsAnalyticsService) { }

    @Get()
    @ApiOperation({ summary: 'Get unified metrics grouped by channel (Web vs Google Chat)' })
    async getChannelsMetrics() {
        return this.channelsAnalyticsService.getChannelsMetrics();
    }
}
