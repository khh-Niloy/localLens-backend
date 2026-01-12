import { Request, Response } from "express";
import { messageService } from "./message.services";
import { responseManager } from "../../utils/responseManager";

const getAllConnectedUser = async (req: Request, res: Response) => {
  try {
    const connections = await messageService.getAllConnectedUserService(
      req.params.id
    );
    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Connection fetched successfully",
      data: connections,
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

const getAllMessage = async (req: Request, res: Response) => {
  try {
    const { messages, receiver } = await messageService.getAllMessageService(
      req.params.conversationId,
      req.query.viewerId as string
    );

    responseManager.success(res, {
      statusCode: 200,
      success: true,
      message: "Messages fetched successfully",
      data: { messages, receiver },
    });
  } catch (error) {
    responseManager.error(res, error as Error, 500);
  }
};

export const messageController = {
  getAllConnectedUser,
  getAllMessage,
};
