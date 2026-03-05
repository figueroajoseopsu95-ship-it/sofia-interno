import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogExecutionDto {
    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    conversationId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    agentName: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    agentVersion?: string;

    @ApiPropertyOptional({ default: 'success' })
    @IsString()
    @IsOptional()
    status?: string = 'success';

    @ApiPropertyOptional()
    @IsOptional()
    inputPayload?: any;

    @ApiPropertyOptional()
    @IsOptional()
    outputPayload?: any;

    @ApiPropertyOptional()
    @IsOptional()
    toolsInvoked?: any;

    @ApiPropertyOptional()
    @IsOptional()
    chunksRetrieved?: any;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    chunksUsedInResponse?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    llmModel?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    totalTokens?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    promptTokens?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    completionTokens?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    costUsd?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    latencyMs?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    n8nExecutionId?: string;
}
