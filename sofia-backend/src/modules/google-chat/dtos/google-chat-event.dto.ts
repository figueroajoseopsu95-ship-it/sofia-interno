import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GoogleChatEventDto {
    @IsString()
    @IsNotEmpty()
    type: string;

    @IsOptional()
    message?: any; // The raw message payload from Google

    @IsOptional()
    space?: any; // The space payload

    @IsOptional()
    user?: any; // The user payload
}
