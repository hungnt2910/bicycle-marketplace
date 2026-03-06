import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  server: Server;

  // Map để track user online
  private onlineUsers = new Map<string, string>(); // userId -> socketId

  // Khi user connect
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Lấy userId từ handshake (cần gửi từ frontend)
    const userId = client.handshake.auth.userId;

    if (userId) {
      this.onlineUsers.set(userId, client.id);
      // Broadcast user online
      this.server.emit('user-online', { userId });
    }
  }

  // Khi user disconnect
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Tìm và remove user khỏi online list
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        this.server.emit('user-offline', { userId });
        break;
      }
    }
  }

  // Join vào conversation room
  @SubscribeMessage('join-conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      client.join(data.conversationId);
      console.log(`🔗 User joined conversation: ${data.conversationId}`);

      client.emit('joined-conversation', {
        conversationId: data.conversationId,
        message: 'Successfully joined conversation',
      });
    } catch (error) {
      throw new WsException('Failed to join conversation');
    }
  }

  // Gửi tin nhắn real-time
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      text: string;
      attachments?: any[];
    },
  ) {
    try {
      // Lưu tin nhắn vào database
      const message = await this.messagesService.sendMessage(
        data.conversationId,
        data.senderId,
        data.text,
        data.attachments,
      );

      // Gửi tin nhắn đến tất cả người trong room (kể cả người gửi)
      this.server.to(data.conversationId).emit('new-message', {
        message,
        conversationId: data.conversationId,
      });
    } catch (error) {
      client.emit('message-error', {
        error: error.message || 'Failed to send message',
      });
    }
  }

  // Typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      userId: string;
      userName: string;
    },
  ) {
    // Gửi đến tất cả người khác trong room (không gửi lại cho người gửi)
    client.to(data.conversationId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      conversationId: data.conversationId,
    });
  }

  // Stop typing
  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      userId: string;
    },
  ) {
    client.to(data.conversationId).emit('user-stop-typing', {
      userId: data.userId,
      conversationId: data.conversationId,
    });
  }

  // Mark as read (real-time)
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      userId: string;
    },
  ) {
    try {
      await this.messagesService.markAsRead(data.conversationId, data.userId);

      // Thông báo cho người kia biết tin nhắn đã được đọc
      client.to(data.conversationId).emit('messages-read', {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark as read' });
    }
  }

  // Kiểm tra user có online không
  @SubscribeMessage('check-online')
  handleCheckOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const isOnline = this.onlineUsers.has(data.userId);
    client.emit('online-status', {
      userId: data.userId,
      isOnline,
    });
  }
}
