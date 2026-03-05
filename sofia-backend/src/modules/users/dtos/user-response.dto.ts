import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/roles.constant';
import { UserStatus, DocumentType } from '@prisma/client';

export class DepartmentReferenceDto {
    @ApiProperty() id: string;
    @ApiProperty() name: string;
    @ApiProperty() code: string;
}

export class UserDepartmentResponseDto {
    @ApiProperty() isPrimary: boolean;
    @ApiProperty() assignedAt: Date;
    @ApiProperty({ type: DepartmentReferenceDto }) department: DepartmentReferenceDto;
}

export class UserResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() employeeCode: string;
    @ApiProperty({ enum: DocumentType }) documentType: DocumentType;
    @ApiProperty() documentNumber: string;
    @ApiProperty() firstName: string;
    @ApiProperty() lastName: string;
    @ApiProperty() email: string;
    @ApiProperty({ required: false }) phone?: string;
    @ApiProperty({ enum: UserRole }) role: UserRole;
    @ApiProperty({ required: false }) position?: string;
    @ApiProperty({ enum: UserStatus }) status: UserStatus;
    @ApiProperty({ required: false }) lastLoginAt?: Date;
    @ApiProperty() failedLoginAttempts: number;
    @ApiProperty({ required: false }) googleChatId?: string;
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;

    @ApiProperty({ type: [UserDepartmentResponseDto] })
    departments: UserDepartmentResponseDto[];
}
