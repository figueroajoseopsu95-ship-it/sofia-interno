import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateStatusDto } from './dtos/update-status.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(filterDto: UserFilterDto) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', role, status, departmentCode, search } = filterDto;

        // Check if the sort key exists
        const validSortKeys = ['createdAt', 'firstName', 'lastName', 'email', 'status', 'role'];
        const orderByKey = validSortKeys.includes(sortBy) ? sortBy : 'createdAt';

        // Construction of WHERE clause
        const where: any = {};

        if (role) where.role = role;
        if (status) where.status = status;

        if (departmentCode) {
            where.departments = {
                some: {
                    department: {
                        code: departmentCode
                    }
                }
            };
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [total, users] = await this.prisma.$transaction([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [orderByKey]: sortOrder },
                include: {
                    departments: {
                        include: { department: true }
                    }
                }
            })
        ]);

        const mappedUsers = users.map(user => this.mapUserResponse(user));

        return {
            data: mappedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.mapUserResponse(user);
    }

    async findByEmployeeCode(employeeCode: string) {
        const user = await this.prisma.user.findUnique({
            where: { employeeCode }
        });
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        // Check existing
        const existingEmail = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
        if (existingEmail) throw new ConflictException('Email already in use');

        const existingEmpCode = await this.prisma.user.findUnique({ where: { employeeCode: createUserDto.employeeCode } });
        if (existingEmpCode) throw new ConflictException('Employee code already exists');

        const passwordHash = await bcrypt.hash(createUserDto.password, 12);

        // Destructure password out so we can construct data
        const { password, ...userData } = createUserDto;

        const user = await this.prisma.user.create({
            data: {
                ...userData,
                passwordHash,
            },
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        return this.mapUserResponse(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        // Check if user exists first
        await this.findById(id);

        // If changing email, check conflict
        if (updateUserDto.email) {
            const existingEmail = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
            if (existingEmail && existingEmail.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        // If changing employee code, check conflict
        if (updateUserDto.employeeCode) {
            const existingEmpCode = await this.prisma.user.findUnique({ where: { employeeCode: updateUserDto.employeeCode } });
            if (existingEmpCode && existingEmpCode.id !== id) {
                throw new ConflictException('Employee code already exists');
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        return this.mapUserResponse(updatedUser);
    }

    async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
        await this.findById(id);

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { status: updateStatusDto.status },
            include: {
                departments: {
                    include: { department: true }
                }
            }
        });

        return this.mapUserResponse(updatedUser);
    }

    async getConversations(userId: string, filterDto: UserFilterDto) {
        // Using Pagination logic
        const { page = 1, limit = 10 } = filterDto;
        const skip = (page - 1) * limit;

        const [total, conversations] = await this.prisma.$transaction([
            this.prisma.conversation.count({ where: { userId } }),
            this.prisma.conversation.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: conversations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // --- Helpers ---
    private mapUserResponse(user: any) {
        // Explicitly stripping passwordHash
        const { passwordHash, ...userWithoutPassword } = user;

        const departments = user.departments?.map((d: any) => ({
            isPrimary: d.isPrimary,
            assignedAt: d.assignedAt,
            department: {
                id: d.department.id,
                name: d.department.name,
                code: d.department.code
            }
        })) || [];

        return {
            ...userWithoutPassword,
            departments
        };
    }
}
