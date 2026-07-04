import createError from "http-errors";
import { listFeed, getById, create, remove } from "./post.service.js";
import asyncHandler from "../../lib/asyncHandler.js";
import { ERROR_CODES } from "../../constants.js";

export const createHandler = asyncHandler(async (req, res) => {
  const post = await create({
    authorId: req.user.id,
    content: req.body.content,
    visibility: req.body.visibility,
    imageBuffer: req.file?.buffer,
  });
  res.status(201).json({ post });
});

export const feedHandler = asyncHandler(async (req, res) => {
  const result = await listFeed({
    viewerId: req.user.id,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json(result);
});

export const getOneHandler = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const post = await getById({ viewerId: req.user.id, postId: id });
  if (!post)
    throw createError(404, "Not found", { code: ERROR_CODES.NOT_FOUND });
  res.json({ post });
});

export const removeHandler = asyncHandler(async (req, res) => {
  await remove(Number(req.params.id));
  res.status(204).end();
});
