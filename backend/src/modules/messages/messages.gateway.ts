import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Message } from 'src/entities';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, message: any): void {
    console.log(message);

    client.emit('reply', 'This is a reply from the server');

    this.server.emit('reply', 'This is a broadcast message to all clients');
  }

  //join room
  @SubscribeMessage('join-conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
    },
  ) {
    client.join(data.conversationId);
  }

  //gửi tin nhắn riêng
  @SubscribeMessage('private-message')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      content: string;
    },
  ) {
    const msg = await this.messagesService.sendMessage(data);

    this.server.to(data.conversationId).emit('private-message', msg);
  }
}
