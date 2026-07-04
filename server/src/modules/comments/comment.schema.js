import { z } from 'zod';

const contentSchema = z
  .string({ required_error: 'Comment cannot be empty' })
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(500, 'Comment is too long (max 500 characters)');

const createCommentBody = z.object({
  content: contentSchema,
  parent_comment_id: z.coerce.number().int().positive().optional(),
});

const postIdParams = z.object({ postId: z.coerce.number().int().positive() });
const commentIdParams = z.object({ id: z.coerce.number().int().positive() });

const listQuery = z.object({
  cursor: z.string().min(1).max(200).optional(),
  limit:  z.coerce.number().int().positive().optional(),
});

export { createCommentBody, postIdParams, commentIdParams, listQuery };