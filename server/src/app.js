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

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
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