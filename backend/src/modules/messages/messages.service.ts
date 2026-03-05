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

  async getConversations(userId: string) {
    return this.convoModel
      .find({ participants: userId })
      .populate('participants', 'name avatar')
      .sort({ updatedAt: -1 });
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    return this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    // Reset unread count
    await this.convoModel.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0,
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    attachments?: any[],
  ) {
    // Kiểm tra conversation có tồn tại và user có quyền
    const conversation = await this.convoModel.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.participants.includes(senderId as any)) {
      throw new Error('You are not a participant of this conversation');
    }

    // Tạo message
    const msg = await this.messageModel.create({
      conversationId,
      senderId,
      content: {
        text,
        attachments: attachments || [],
      },
      isRead: false,
    });

    // Cập nhật lastMessage và tăng unreadCount
    const otherUserId = conversation.participants
      .find((p) => p.toString() !== senderId)
      ?.toString();

    await this.convoModel.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text,
        senderId,
        timestamp: new Date(),
      },
      $inc: {
        [`unreadCount.${otherUserId}`]: 1,
      },
      updatedAt: new Date(),
    });

    // Populate để trả về đầy đủ thông tin
    return this.messageModel
      .findById(msg._id)
      .populate('senderId', 'email firstName lastName');
  }
}
