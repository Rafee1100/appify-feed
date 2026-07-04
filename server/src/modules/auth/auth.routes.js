import { Router } from "express";
import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  validate({ body: registerSchema }),
  registerHandler,
);
router.post(
  "/login",
  loginLimiter,
  validate({ body: loginSchema }),
  loginHandler,
);
router.post("/refresh", refreshLimiter, refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);

export default router;
