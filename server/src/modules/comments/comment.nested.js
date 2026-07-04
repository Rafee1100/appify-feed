import { Router } from "express";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import { canViewPrivatePost } from "../posts/post.service.js";
import { createCommentLimiter } from "../../middleware/rateLimit.js";
import {
  createCommentBody,
  postIdParams,
  listQuery,
} from "./comment.schema.js";
import { createHandler, listForPostHandler } from "./comment.controller.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  createCommentLimiter,
  validate({ params: postIdParams, body: createCommentBody }),
  canViewPrivatePost,
  createHandler,
);
router.get(
  "/",
  authenticate,
  validate({ params: postIdParams, query: listQuery }),
  canViewPrivatePost,
  listForPostHandler,
);

export default router;