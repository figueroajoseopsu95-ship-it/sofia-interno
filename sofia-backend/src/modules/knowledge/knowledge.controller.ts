import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { UpdateCollectionDto } from './dtos/update-collection.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@ApiTags('Knowledge Base Collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('knowledge/collections')
export class KnowledgeController {
    constructor(private readonly knowledgeService: KnowledgeService) { }

    @Get()
    @ApiOperation({ summary: 'List all internal document collections with stats' })
    @ApiResponse({ status: 200, description: 'Return all collections' })
    async findAll() {
        return this.knowledgeService.findAllCollections();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get collection details with paginated list of documents' })
    @ApiResponse({ status: 200, description: 'Return collection details and documents' })
    async findById(@Param('id') id: string, @Query() paginationQuery: PaginationQueryDto) {
        return this.knowledgeService.findCollectionById(id, paginationQuery);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new knowledge collection' })
    @ApiResponse({ status: 201, description: 'Collection created successfully' })
    async create(@Body() createDto: CreateCollectionDto) {
        return this.knowledgeService.createCollection(createDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update collection configuration (chunk_strategy, etc)' })
    @ApiResponse({ status: 200, description: 'Collection updated successfully' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateCollectionDto) {
        return this.knowledgeService.updateCollection(id, updateDto);
    }
}
