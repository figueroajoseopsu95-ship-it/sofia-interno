import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty({ example: 'Recursos Humanos' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'RRHH' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional({ example: 'Depto de manejo de personal' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
