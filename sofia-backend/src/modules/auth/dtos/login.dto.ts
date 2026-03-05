import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'EMP001', description: 'The employee code assigned to the user' })
    @IsString()
    @IsNotEmpty()
    employeeCode: string;

    @ApiProperty({ example: 'Sofia2026!', description: 'User password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
