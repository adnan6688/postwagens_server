import { z } from 'zod';

const createCommentSchema = z.object({
    text: z.string(),
    parentId: z.string().optional(),
  });

const updateCommentSchema = z.object({
    text: z.string().optional(),
  });

export const CommentValidation = {
  createCommentSchema,
  updateCommentSchema,
};
