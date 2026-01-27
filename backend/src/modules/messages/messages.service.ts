import { Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationDocument,
  ConversationStatus,
} from '../../entities/conversation.entity';
import { Message, MessageDocument } from '../../entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Conversation.name)
    private convoModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createConversation(userA: string, userB: string) {
    let convo = await this.convoModel.findOne({
      participants: { $all: [userA, userB] },
    });

    if (!convo) {
      convo = await this.convoModel.create({
        participants: [userA, userB],

        unreadCount: {
          [userA]: 0,
          [userB]: 0,
        },
        status: ConversationStatus.ACTIVE,
      });
    }

    return convo;
  }

  async sendMessage(data: any) {
    const msg = await this.messageModel.create({
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.message,
      isRead: false,
    });

    await this.convoModel.findByIdAndUpdate(data.conversationId, {
      lastMessage: {
        text: data.message,
        senderId: data.senderId,
        timestamp: new Date(),
      },
    });

    return msg;
  }
}
