import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateStatusDto {
    @ApiProperty({ enum: UserStatus, example: UserStatus.active })
    @IsEnum(UserStatus)
    @IsNotEmpty()
    status: UserStatus;
}
