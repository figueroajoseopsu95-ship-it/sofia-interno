import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const departments = await this.prisma.department.findMany({
            include: {
                parent: {
                    select: { id: true, name: true, code: true }
                },
                children: {
                    select: { id: true, name: true, code: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // We can format it as a tree if needed, or simply return flat with relationships
        return departments;
    }

    async findById(id: string) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                parent: { select: { id: true, name: true, code: true } },
                children: { select: { id: true, name: true, code: true } },
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                employeeCode: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }

        // Formatting users cleanly
        const usersAssigned = department.users.map(u => ({
            isPrimary: u.isPrimary,
            assignedAt: u.assignedAt,
            user: u.user
        }));

        const { users, ...deptData } = department;

        return {
            ...deptData,
            users: usersAssigned
        };
    }

    async create(createDeptDto: CreateDepartmentDto) {
        const existingCode = await this.prisma.department.findUnique({ where: { code: createDeptDto.code } });
        if (existingCode) throw new ConflictException(`Department code ${createDeptDto.code} already exists`);

        const existingName = await this.prisma.department.findUnique({ where: { name: createDeptDto.name } });
        if (existingName) throw new ConflictException(`Department name ${createDeptDto.name} already exists`);

        if (createDeptDto.parentId) {
            const parent = await this.prisma.department.findUnique({ where: { id: createDeptDto.parentId } });
            if (!parent) throw new NotFoundException(`Parent department ID ${createDeptDto.parentId} not found`);
        }

        return this.prisma.department.create({
            data: createDeptDto
        });
    }

    async update(id: string, updateDeptDto: UpdateDepartmentDto) {
        await this.findById(id);

        if (updateDeptDto.code) {
            const existingCode = await this.prisma.department.findUnique({ where: { code: updateDeptDto.code } });
            if (existingCode && existingCode.id !== id) {
                throw new ConflictException(`Department code ${updateDeptDto.code} already exists`);
            }
        }

        if (updateDeptDto.parentId) {
            // Avoid circular dependency (self-parenting)
            if (id === updateDeptDto.parentId) {
                throw new ConflictException('A department cannot be its own parent');
            }

            const parent = await this.prisma.department.findUnique({ where: { id: updateDeptDto.parentId } });
            if (!parent) throw new NotFoundException(`Parent department ID ${updateDeptDto.parentId} not found`);
        }

        return this.prisma.department.update({
            where: { id },
            data: updateDeptDto
        });
    }

    async assignUser(departmentId: string, userId: string, isPrimary: boolean = false) {
        await this.findById(departmentId);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        // Only one primary department allowed. Unset others if this is primary.
        if (isPrimary) {
            await this.prisma.userDepartment.updateMany({
                where: { userId },
                data: { isPrimary: false }
            });
        }

        return this.prisma.userDepartment.upsert({
            where: {
                userId_departmentId: { userId, departmentId }
            },
            update: { isPrimary },
            create: {
                userId,
                departmentId,
                isPrimary
            }
        });
    }

    async removeUser(departmentId: string, userId: string) {
        const assign = await this.prisma.userDepartment.findUnique({
            where: {
                userId_departmentId: { userId, departmentId }
            }
        });

        if (!assign) throw new NotFoundException('User is not assigned to this department');

        await this.prisma.userDepartment.delete({
            where: {
                userId_departmentId: { userId, departmentId }
            }
        });

        return { message: 'User removed from department successfully' };
    }
}
