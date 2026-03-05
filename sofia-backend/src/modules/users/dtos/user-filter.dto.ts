import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dtos/pagination.dto';
import { UserRole } from '../../../common/constants/roles.constant';
import { UserStatus } from '@prisma/client';
import { DepartmentCode } from '../../../common/constants/departments.constant';

export class UserFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional({ enum: DepartmentCode })
    @IsOptional()
    @IsEnum(DepartmentCode)
    departmentCode?: DepartmentCode;

    @ApiPropertyOptional({ description: 'Search term for name, email or employeeCode' })
    @IsOptional()
    @IsString()
    search?: string;
}
