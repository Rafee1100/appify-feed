import { toggle, listLikers } from "./like.service.js";
import asyncHandler from "../../lib/asyncHandler.js";

export const toggleHandler = asyncHandler(async (req, res) => {
  const result = await toggle({
    userId: req.user.id,
    targetType: req.body.target_type,
    targetId: req.body.target_id,
  });
  res.json(result);
});

export const listHandler = asyncHandler(async (req, res) => {
  const result = await listLikers({
    targetType: req.query.target_type,
    targetId: req.query.target_id,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json(result);
});
