import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dtos/search-request.dto';
import { SearchResponseDto } from './dtos/search-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Everyone authenticated can search
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Public endpoint for employee semantic search' })
    @ApiResponse({ status: 200, type: SearchResponseDto })
    async search(
        @Body() searchReq: SearchRequestDto,
        @CurrentUser() user: any
    ) {
        // correlationId might be tracked via interceptors / request scope, but usually we just log 
        // basic user action in this manual mode
        const dummyCorrelationId = 'frontend-search-request';
        return this.searchService.search(searchReq, user.id, dummyCorrelationId);
    }
}
