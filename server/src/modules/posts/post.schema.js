import { z } from "zod";
import { VISIBILITY } from "../../constants.js";

const visibilityEnum = z.enum([VISIBILITY.PUBLIC, VISIBILITY.PRIVATE], {
  errorMap: () => ({ message: "Visibility must be 'public' or 'private'" }),
});

const contentSchema = z
  .string({ required_error: "Post content is required" })
  .trim()
  .min(1, "Post content cannot be empty")
  .max(2000, "Post content is too long (max 2000 characters)");

const createPostBody = z.object({
  content: contentSchema,
  visibility: visibilityEnum.optional().default(VISIBILITY.PUBLIC),
});

const idParams = z.object({ id: z.coerce.number().int().positive() });

const feedQuery = z.object({
  cursor: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export { createPostBody, idParams, feedQuery };
