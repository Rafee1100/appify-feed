import { Router } from "express";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import { toggleLikeLimiter } from "../../middleware/rateLimit.js";
import { toggleLikeBody, listLikesQuery } from "./like.schema.js";
import { toggleHandler, listHandler } from "./like.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  toggleLikeLimiter,
  validate({ body: toggleLikeBody }),
  toggleHandler,
);
router.get("/", authenticate, validate({ query: listLikesQuery }), listHandler);

export default router;
