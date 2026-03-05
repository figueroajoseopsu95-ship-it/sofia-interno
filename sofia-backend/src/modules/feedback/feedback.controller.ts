import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { FeedbackResponseDto } from './dtos/feedback-response.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    @ApiOperation({ summary: 'Submit feedback for a specific message' })
    @ApiResponse({ status: 201, type: FeedbackResponseDto })
    async create(
        @Body() dto: CreateFeedbackDto,
        @CurrentUser() user: any
    ) {
        return this.feedbackService.create(user.id, dto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get paginated history of your submitted feedback' })
    async getMyFeedback(
        @Query() pagination: PaginationQueryDto,
        @CurrentUser() user: any
    ) {
        return this.feedbackService.getByUser(user.id, pagination);
    }
}
