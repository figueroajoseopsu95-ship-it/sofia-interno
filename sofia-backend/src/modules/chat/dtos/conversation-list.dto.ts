import { ApiProperty } from '@nestjs/swagger';

export class ConversationListDto {
    @ApiProperty() id: string;
    @ApiProperty() title: string;
    @ApiProperty() channel: string;
    @ApiProperty() status: string;
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;

    @ApiProperty({ required: false })
    lastMessage?: string;
}
