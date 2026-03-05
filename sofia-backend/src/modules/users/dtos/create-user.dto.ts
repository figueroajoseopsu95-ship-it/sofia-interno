import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { UserRole } from '../../../common/constants/roles.constant';

export class CreateUserDto {
    @ApiProperty({ example: 'EMP005', description: 'Unique employee code' })
    @IsString()
    @IsNotEmpty()
    employeeCode: string;

    @ApiProperty({ enum: DocumentType, example: DocumentType.V })
    @IsEnum(DocumentType)
    @IsNotEmpty()
    documentType: DocumentType;

    @ApiProperty({ example: '12345678', description: 'Identity document number' })
    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Perez' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'juan@banesco.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Sofia2026!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @ApiPropertyOptional({ example: 'Analista de Sistemas' })
    @IsString()
    @IsOptional()
    position?: string;
}
