import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import env from './config/env.js';
import authRoutes    from './modules/auth/auth.routes.js';
import postRoutes    from './modules/posts/post.routes.js';
import commentRoutes from './modules/comments/comment.routes.js';
import likeRoutes    from './modules/likes/like.routes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.set("trust proxy", true);

const allowedOrigins = env.CLIENT_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`[cors] Allowed origins: ${allowedOrigins.join(", ")}`);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;