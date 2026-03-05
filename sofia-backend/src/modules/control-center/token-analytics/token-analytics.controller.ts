import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TokenAnalyticsService } from './token-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Control Center - Token Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/analytics')
export class TokenAnalyticsController {
    constructor(private readonly tokenAnalyticsService: TokenAnalyticsService) { }

    @Get('tokens')
    @ApiOperation({ summary: 'Get token consumption analytics' })
    async getTokens() {
        return this.tokenAnalyticsService.getTokensConsumption();
    }

    @Get('costs')
    @ApiOperation({ summary: 'Get cost analytics in USD' })
    async getCosts() {
        return this.tokenAnalyticsService.getCosts();
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get latency percentiles (P50, P95, P99) by agent' })
    async getPerformance() {
        return this.tokenAnalyticsService.getPerformance();
    }
}
