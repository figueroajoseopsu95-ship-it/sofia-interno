import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, ChannelType } from './dtos/create-conversation.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { PaginationQueryDto } from '../../common/dtos/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessageResponseDto } from './dtos/message-response.dto';

@ApiTags('Chat Interactivity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat/conversations')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    @ApiOperation({ summary: 'Create new chat conversation' })
    @ApiResponse({ status: 201, description: 'Conversation created' })
    async createConversation(
        @Body() dto: CreateConversationDto,
        @CurrentUser() user: any
    ) {
        return this.chatService.createConversation(user.id, ChannelType.WEB, dto.title);
    }

    @Get()
    @ApiOperation({ summary: 'Get paginated history of user conversations' })
    async getConversations(
        @Query() pagination: PaginationQueryDto,
        @CurrentUser() user: any
    ) {
        return this.chatService.getConversations(user.id, pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific conversation detail with messages' })
    async getDetail(
        @Param('id') id: string,
        @Query() pagination: PaginationQueryDto,
        @CurrentUser() user: any
    ) {
        return this.chatService.getConversationDetail(id, user.id, pagination);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send a message to SOFIA Assistant and get response' })
    @ApiResponse({ status: 201, type: MessageResponseDto })
    async sendMessage(
        @Param('id') id: string,
        @Body() dto: SendMessageDto,
        @CurrentUser() user: any
    ) {
        // This calls n8n synchronously over HTTP to wait for the immediate reply.
        // For WS use, Gateway will wrap this logic.
        return this.chatService.sendMessage(id, user.id, dto.content);
    }

    @Patch(':id/close')
    @ApiOperation({ summary: 'Close a conversation manually' })
    async closeConversation(
        @Param('id') id: string,
        @CurrentUser() user: any
    ) {
        return this.chatService.closeConversation(id, user.id);
    }
}
