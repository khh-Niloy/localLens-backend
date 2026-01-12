import { Router } from "express";
import { messageController } from "./message.controller";

export const messageRoutes = Router()

messageRoutes.get("/connections/:id", messageController.getAllConnectedUser)
messageRoutes.get("/messages/:conversationId", messageController.getAllMessage)
