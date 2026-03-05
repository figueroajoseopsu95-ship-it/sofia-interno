import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { AssignUserDto } from './dtos/assign-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Get()
    @Public() // Or keep it guarded, depends on the use case. Making it public as list of depts is often needed pre-login
    @ApiOperation({ summary: 'Get all departments with their hierarchy' })
    @ApiResponse({ status: 200, description: 'Return all departments' })
    async findAll() {
        return this.departmentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department details with assigned users' })
    @ApiResponse({ status: 200, description: 'Return department details' })
    async findById(@Param('id') id: string) {
        return this.departmentsService.findById(id);
    }

    @Post()
    @Roles(UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new department' })
    @ApiResponse({ status: 201, description: 'Department created successfully' })
    async create(@Body() createDeptDto: CreateDepartmentDto) {
        return this.departmentsService.create(createDeptDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update a department' })
    @ApiResponse({ status: 200, description: 'Department updated successfully' })
    async update(@Param('id') id: string, @Body() updateDeptDto: UpdateDepartmentDto) {
        return this.departmentsService.update(id, updateDeptDto);
    }

    @Post(':id/users')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Assign a user to a department' })
    @ApiResponse({ status: 201, description: 'User assigned successfully' })
    async assignUser(@Param('id') departmentId: string, @Body() assignUserDto: AssignUserDto) {
        return this.departmentsService.assignUser(departmentId, assignUserDto.userId, assignUserDto.isPrimary);
    }

    @Delete(':id/users/:userId')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Remove a user from a department' })
    @ApiResponse({ status: 200, description: 'User removed successfully' })
    async removeUser(@Param('id') departmentId: string, @Param('userId') userId: string) {
        return this.departmentsService.removeUser(departmentId, userId);
    }
}
