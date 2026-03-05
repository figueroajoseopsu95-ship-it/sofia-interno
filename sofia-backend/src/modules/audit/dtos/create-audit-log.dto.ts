import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    @IsNotEmpty()
    correlationId: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsOptional()
    resourceType?: string;

    @IsString()
    @IsOptional()
    resourceId?: string;

    @IsOptional()
    details?: any;

    @IsString()
    @IsOptional()
    ipAddress?: string;

    @IsString()
    @IsOptional()
    userAgent?: string;

    @IsString()
    @IsOptional()
    result?: string;
}
