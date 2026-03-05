import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentAnalyticsService } from './agent-analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';

@ApiTags('Admin Control Center - Agent Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/agents')
export class AgentAnalyticsController {
    constructor(private readonly agentAnalyticsService: AgentAnalyticsService) { }

    @Get()
    @ApiOperation({ summary: 'List top 10 agents with metrics' })
    async getAgents() {
        return this.agentAnalyticsService.getAgentsList();
    }

    @Get(':name')
    @ApiOperation({ summary: 'Get detailed metrics for a specific agent' })
    async getAgentDetail(@Param('name') name: string) {
        return this.agentAnalyticsService.getAgentDetail(name);
    }

    @Get(':name/executions')
    @ApiOperation({ summary: 'Get paginated executions for a specific agent' })
    async getAgentExecutions(
        @Param('name') name: string,
        @Query() pagination: PaginationQueryDto
    ) {
        return this.agentAnalyticsService.getAgentExecutions(name, pagination);
    }
}
