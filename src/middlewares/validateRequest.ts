import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

export const validateRequest =
  (ZodSchema: ZodObject, part: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;

      if (part === 'body') {
        let requestBody = req.body;
        if (requestBody?.data) {
          requestBody = JSON.parse(requestBody.data);
        }
        dataToValidate = requestBody || {};
      } else if (part === 'query') {
        dataToValidate = req.query || {};
      } else {
        dataToValidate = req.params || {};
      }

      const validatedData = await ZodSchema.parseAsync(dataToValidate);

      if (part === 'body') {
        req.body = validatedData;
      }

      next();
    } catch (error) {
      next(error);
    }
  };