import { IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserDto {
    @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    @IsUUID()
    userId: string;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean = false;
}
