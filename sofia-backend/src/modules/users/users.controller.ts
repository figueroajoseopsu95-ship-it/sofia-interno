import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateStatusDto } from './dtos/update-status.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get paginated list of employees with filters' })
    @ApiResponse({ status: 200, description: 'Return paginated users' })
    async findAll(@Query() filterDto: UserFilterDto) {
        return this.usersService.findAll(filterDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user details by ID' })
    @ApiResponse({ status: 200, description: 'Return user details', type: UserResponseDto })
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new employee' })
    @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update employee details' })
    @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Change user status (active/blocked/suspended)' })
    @ApiResponse({ status: 200, description: 'User status updated', type: UserResponseDto })
    async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
        return this.usersService.updateStatus(id, updateStatusDto);
    }

    @Get(':id/conversations')
    @ApiOperation({ summary: 'Get user conversation history' })
    @ApiResponse({ status: 200, description: 'Return user conversations' })
    async getConversations(@Param('id') id: string, @Query() filterDto: UserFilterDto) {
        // Just verifying user exists
        await this.usersService.findById(id);
        return this.usersService.getConversations(id, filterDto);
    }
}
