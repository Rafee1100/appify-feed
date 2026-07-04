import { Router } from "express";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import upload from "../../middleware/upload.js";
import { createPostLimiter } from "../../middleware/rateLimit.js";
import { createPostBody, idParams, feedQuery } from "./post.schema.js";
import { isPostOwner, canViewPrivatePost } from "./post.service.js";
import {
  createHandler,
  feedHandler,
  getOneHandler,
  removeHandler,
} from "./post.controller.js";

import commentNestedRoutes from "../comments/comment.nested.js";

const router = Router();

router.get("/", authenticate, validate({ query: feedQuery }), feedHandler);
router.post(
  "/",
  authenticate,
  createPostLimiter,
  upload.single("image"),
  validate({ body: createPostBody }),
  createHandler,
);
router.get(
  "/:id",
  authenticate,
  validate({ params: idParams }),
  canViewPrivatePost,
  getOneHandler,
);
router.delete(
  "/:id",
  authenticate,
  validate({ params: idParams }),
  isPostOwner,
  removeHandler,
);

router.use("/:postId/comments", commentNestedRoutes);

export default router;
