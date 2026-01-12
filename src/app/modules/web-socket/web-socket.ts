import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "../../../app";
import { disconnect } from "process";
import { conversationModel, messageModel } from "./message.model";
import { IMessage } from "./message.interface";

export const httpServer = createServer(app);

const webSocketServer = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

webSocketServer.on("connection", (socket) => {
  //joining in a room
  socket.on("identify", ({ userId }) => {
    socket.data.userId = userId;
    socket.join(`user-${userId}`);
    console.log(`${userId} joined in a room`);
  });

  socket.on("send-message", async ({ receiverId, messageText }) => {
    const senderId = socket.data.userId;
    console.log(senderId)

    //find conversation
    // Find or create conversation (check both directions)
    const conversation = await conversationModel.findOneAndUpdate(
      {
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      { 
        $setOnInsert: { senderId, receiverId, createdAt: new Date() } 
      },
      { upsert: true, new: true }
    );

    // Save message
    const message = await messageModel.create({
      conversationId: conversation?._id,
      senderId,
      receiverId,
      message: messageText,
    });

    webSocketServer.to(`user-${receiverId}`).emit("new-message", {
      conversationId: conversation._id,
      from: senderId,
      text: messageText,
      createdAt: message.createdAt,
    });

    webSocketServer.to(`user-${senderId}`).emit("new-message", {
      conversationId: conversation._id,
      from: senderId,
      text: messageText,
      createdAt: message.createdAt,
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
});
