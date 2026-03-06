import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@GetUser('id') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string) {
    return this.messagesService.getMessages(conversationId);
  }

  @Post('conversations')
  createConversation(
    @GetUser('id') user: User,
    @Body('otherUserId') otherUserId: string,
  ) {
    return this.messagesService.createConversation(
      user._id.toString(),
      otherUserId,
    );
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @GetUser() user: User,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const message = await this.messagesService.sendMessage(
      conversationId,
      user._id.toString(),
      sendMessageDto.text,
      sendMessageDto.attachments,
    );

    return {
      message: 'Message sent successfully',
      data: message,
    };
  }

  @Post('conversations/:id/read')
  markAsRead(@Param('id') conversationId: string, @GetUser('id') user: User) {
    return this.messagesService.markAsRead(conversationId, user._id.toString());
  }
}
