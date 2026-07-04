import { z } from "zod";
import { TARGET_TYPE } from "../../constants.js";

const targetTypeEnum = z.enum([TARGET_TYPE.POST, TARGET_TYPE.COMMENT], {
  errorMap: () => ({ message: "target_type must be 'post' or 'comment'" }),
});

const toggleLikeBody = z.object({
  target_type: targetTypeEnum,
  target_id: z.coerce.number().int().positive(),
});

const listLikesQuery = z.object({
  target_type: targetTypeEnum,
  target_id: z.coerce.number().int().positive(),
  cursor: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export { toggleLikeBody, listLikesQuery };
