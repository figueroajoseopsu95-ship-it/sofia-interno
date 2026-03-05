import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...', description: 'A valid refresh token' })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
