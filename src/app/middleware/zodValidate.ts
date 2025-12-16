import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateSchema =
  (zodSchema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Handle multipart form data
      if(req.body?.data){
        req.body = JSON.parse(req.body.data)
      }
      
      // Ensure req.body exists, if not set it to empty object
      if (!req.body) {
        req.body = {};
      }
      
      // Validate the request object (body, params, query)
      const validatedData = await zodSchema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      // Update req.body with validated data
      req.body = validatedData.body;
      
      next();
    } catch (error) {
      next(error);
    }
  };