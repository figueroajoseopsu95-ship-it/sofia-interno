import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class N8nIntegrationService {
    private readonly logger = new Logger(N8nIntegrationService.name);
    private readonly n8nBaseUrl: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        this.n8nBaseUrl = this.configService.get<string>('N8N_BASE_URL', 'http://sofia-n8n:5678');
    }

    async getStatus() {
        try {
            const response = await axios.get(`${this.n8nBaseUrl}/healthz`, { timeout: 5000 });
            return { status: 'online', response: response.data };
        } catch (error) {
            this.logger.error(`n8n health check failed: ${(error as any).message}`);
            return { status: 'offline', error: (error as any).message };
        }
    }

    async getWorkflows() {
        // In a real scenario, you would use n8n's public API to fetch these with an API Key
        // Mocking standard response structure for this scaffold
        return [
            { id: '1', name: 'SOFIA Router Agent', active: true, nodesCount: 12, createdAt: new Date() },
            { id: '2', name: 'HR Intranet Scraper', active: true, nodesCount: 8, createdAt: new Date() },
            { id: '3', name: 'Document Ingestion Pipeline', active: false, nodesCount: 24, createdAt: new Date() }
        ];
    }

    async getExecutions() {
        // For n8n executions we can fetch our own logged records 
        // rather than n8n's internal execution table which is isolated
        const recentExecutions = await this.prisma.agentExecutionLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                agentName: true,
                status: true,
                latencyMs: true,
                n8nExecutionId: true,
                createdAt: true
            }
        });
        return recentExecutions;
    }
}
