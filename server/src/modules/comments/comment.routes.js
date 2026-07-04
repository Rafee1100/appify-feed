import { Router } from "express";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import { isCommentOwner } from "./comment.service.js";
import { createCommentLimiter } from "../../middleware/rateLimit.js";
import {
  createCommentBody,
  postIdParams,
  commentIdParams,
  listQuery,
} from "./comment.schema.js";
import { removeHandler, listRepliesHandler } from "./comment.controller.js";

const router = Router();

router.delete(
  "/:id",
  authenticate,
  validate({ params: commentIdParams }),
  isCommentOwner,
  removeHandler,
);
router.get(
  "/:id/replies",
  authenticate,
  validate({ params: commentIdParams, query: listQuery }),
  listRepliesHandler,
);

export default router;
