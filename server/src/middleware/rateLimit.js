import { RateLimiterMySQL } from "rate-limiter-flexible";
import env from "../config/env.js";
import { callbackPool } from "../config/db.js";

function makeLimiter({ points, duration, keyPrefix }) {
  return new RateLimiterMySQL({
    storeClient: callbackPool,
    storeType: "pool",
    dbName: env.DB_NAME,
    tableName: "rate_limit",
    points,
    duration,
    keyPrefix,
    tableCreated: true,
  });
}

function makeMiddleware({ byUser, points, duration, keyPrefix }) {
  const limiter = makeLimiter({ points, duration, keyPrefix });
  return (req, res, next) => {
    const key = byUser ? `u:${req.user?.id ?? "anon"}` : `ip:${req.ip}`;
    limiter
      .consume(key)
      .then(() => next())
      .catch((err) => {
        if (
          err &&
          typeof err === "object" &&
          typeof err.msBeforeNext === "number"
        ) {
          return res.status(429).json({
            error: "RateLimited",
            message: "Too many requests. Please try again later.",
          });
        }
        next(err);
      });
  };
}

export const loginLimiter = makeMiddleware({
  byUser: false,
  points: 10,
  duration: 15 * 60,
  keyPrefix: "login_",
});
export const registerLimiter = makeMiddleware({
  byUser: false,
  points: 10,
  duration: 60 * 60,
  keyPrefix: "register_",
});
export const refreshLimiter = makeMiddleware({
  byUser: false,
  points: 60,
  duration: 60 * 60,
  keyPrefix: "refresh_",
});

export const createPostLimiter = makeMiddleware({
  byUser: true,
  points: 30,
  duration: 60 * 60,
  keyPrefix: "create_post_",
});
export const createCommentLimiter = makeMiddleware({
  byUser: true,
  points: 60,
  duration: 60,
  keyPrefix: "create_comment_",
});
export const toggleLikeLimiter = makeMiddleware({
  byUser: true,
  points: 120,
  duration: 60,
  keyPrefix: "toggle_like_",
});
export const uploadLimiter = makeMiddleware({
  byUser: true,
  points: 30,
  duration: 60 * 60,
  keyPrefix: "upload_",
});
