import { model, Schema } from "mongoose";
import { IConversation, IMessage } from "./message.interface";

const conversationSchema = new Schema<IConversation>({
  receiverId: { type: Schema.Types.ObjectId, ref:"User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref:"User", required: true },
  createdAt: { type: Date },
});

conversationSchema.index({ senderId: 1, receiverId: 1 });
conversationSchema.index({ receiverId: 1 });

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  receiverId: { type: Schema.Types.ObjectId, ref:"User", required: true },
  senderId: { type: Schema.Types.ObjectId, ref:"User", required: true },
  message: { type: String, required: true },
}, {
  timestamps: true
});

messageSchema.index({conversationId: 1})

export const conversationModel = model<IConversation>("Conversation", conversationSchema);
export const messageModel = model<IMessage>("Message", messageSchema);
