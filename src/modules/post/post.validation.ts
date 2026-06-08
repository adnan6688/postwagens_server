import { z } from 'zod';

export const createPostZodSchema = z.object({
  text: z.string(),
});

export const updatePostZodSchema = z.object({
  text: z.string().optional(),
});

export const deletePostMediaZodSchema = z.object({
  postId: z.string(),
  mediaUrl: z.string(),
});
