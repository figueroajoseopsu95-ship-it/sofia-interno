import { Module } from '@nestjs/common';

import { OverviewService } from './overview/overview.service';
import { OverviewController } from './overview/overview.controller';

import { AgentAnalyticsService } from './agent-analytics/agent-analytics.service';
import { AgentAnalyticsController } from './agent-analytics/agent-analytics.controller';

import { TokenAnalyticsService } from './token-analytics/token-analytics.service';
import { TokenAnalyticsController } from './token-analytics/token-analytics.controller';

import { RagAnalyticsService } from './rag-analytics/rag-analytics.service';
import { RagAnalyticsController } from './rag-analytics/rag-analytics.controller';

import { FeedbackAnalyticsService } from './feedback-analytics/feedback-analytics.service';
import { FeedbackAnalyticsController } from './feedback-analytics/feedback-analytics.controller';

import { ChannelsAnalyticsService } from './channels-analytics/channels-analytics.service';
import { ChannelsAnalyticsController } from './channels-analytics/channels-analytics.controller';

import { N8nIntegrationService } from './n8n-integration/n8n-integration.service';
import { N8nIntegrationController } from './n8n-integration/n8n-integration.controller';

import { SecurityMonitorService } from './security-monitor/security-monitor.service';
import { SecurityMonitorController } from './security-monitor/security-monitor.controller';

@Module({
    controllers: [
        OverviewController,
        AgentAnalyticsController,
        TokenAnalyticsController,
        RagAnalyticsController,
        FeedbackAnalyticsController,
        ChannelsAnalyticsController,
        N8nIntegrationController,
        SecurityMonitorController
    ],
    providers: [
        OverviewService,
        AgentAnalyticsService,
        TokenAnalyticsService,
        RagAnalyticsService,
        FeedbackAnalyticsService,
        ChannelsAnalyticsService,
        N8nIntegrationService,
        SecurityMonitorService
    ],
})
export class ControlCenterModule { }
