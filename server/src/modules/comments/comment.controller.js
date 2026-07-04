import { listForPost, listReplies, create, remove } from "./comment.service.js";
import asyncHandler from "../../lib/asyncHandler.js";

export const listForPostHandler = asyncHandler(async (req, res) => {
  const postId = Number(req.params.postId);
  const result = await listForPost({
    viewerId: req.user.id,
    postId,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json(result);
});

export const listRepliesHandler = asyncHandler(async (req, res) => {
  const commentId = Number(req.params.id);
  const result = await listReplies({
    viewerId: req.user.id,
    commentId,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json(result);
});

export const createHandler = asyncHandler(async (req, res) => {
  const postId = Number(req.params.postId);
  const comment = await create({
    postId,
    authorId: req.user.id,
    content: req.body.content,
    parentCommentId: req.body.parent_comment_id,
  });
  res.status(201).json({ comment });
});

export const removeHandler = asyncHandler(async (req, res) => {
  await remove(Number(req.params.id));
  res.status(204).end();
});
