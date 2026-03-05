import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { N8nIntegrationService } from './n8n-integration.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin Control Center - n8n Integration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.superadmin)
@Controller('control/n8n')
export class N8nIntegrationController {
    constructor(private readonly n8nIntegrationService: N8nIntegrationService) { }

    @Get('status')
    @ApiOperation({ summary: 'Ping internal n8n service for health status' })
    async getStatus() {
        return this.n8nIntegrationService.getStatus();
    }

    @Get('workflows')
    @ApiOperation({ summary: 'Get list of configured generative workflows in n8n' })
    async getWorkflows() {
        return this.n8nIntegrationService.getWorkflows();
    }

    @Get('executions')
    @ApiOperation({ summary: 'Get latest recorded n8n workflow executions' })
    async getExecutions() {
        return this.n8nIntegrationService.getExecutions();
    }
}
