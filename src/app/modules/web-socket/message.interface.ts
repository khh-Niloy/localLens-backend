import { Types } from 'mongoose';

export interface IConversation {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  // lastMessage: string;
  // lastMessageAt: string;
  createdAt: Date
}

export interface IMessage {
  conversationId: Types.ObjectId;
  receiverId: Types.ObjectId;
  senderId: Types.ObjectId;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}
