import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackAnalyticsService } from './feedback-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Control Center - Feedback Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/feedback')
export class FeedbackAnalyticsController {
    constructor(private readonly feedbackAnalyticsService: FeedbackAnalyticsService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Get global feedback score and rating distribution' })
    async getOverview() {
        return this.feedbackAnalyticsService.getOverview();
    }

    @Get('trends')
    @ApiOperation({ summary: 'Get daily feedback score evolution (last 30d)' })
    async getTrends() {
        return this.feedbackAnalyticsService.getTrends();
    }

    @Get('by-agent')
    @ApiOperation({ summary: 'Get feedback averages aggregated by AI Agent' })
    async getFeedbackByAgent() {
        return this.feedbackAnalyticsService.getFeedbackByAgent();
    }
}
