import { User } from "../users/user.model";
import { conversationModel, messageModel } from "./message.model";

const getAllConnectedUserService = async (id: string) => {
  const conversations = await conversationModel
    .find({
      $or: [{ senderId: id }, { receiverId: id }],
    })
    .populate("senderId", "name image")
    .populate("receiverId", "name image")
    .sort({ createdAt: -1 });

  return conversations.map((conv: any) => {
    const isSender = conv.senderId._id.toString() === id;
    const companion = isSender ? conv.receiverId : conv.senderId;

    return {
      _id: conv._id,
      companion,
    };
  });
};

const getAllMessageService = async (
  conversationId: string,
  viewerId?: string
) => {
  const messages = await messageModel.find({
    conversationId: conversationId,
  });

  const conversation = await conversationModel
    .findById(conversationId)
    .populate("senderId", "name image")
    .populate("receiverId", "name image");

  if (!conversation) return { messages: [], receiver: null };

  const receiver =
    conversation.senderId._id.toString() === viewerId
      ? conversation.receiverId
      : conversation.senderId;

  return { messages, receiver };
};

export const messageService = {
  getAllConnectedUserService,
  getAllMessageService,
};
