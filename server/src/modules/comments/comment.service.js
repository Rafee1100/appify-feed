import createError from "http-errors";
import { query, withTransaction } from "../../config/db.js";
import { encodeCursor, decodeCursor, parseLimit } from "../../lib/cursor.js";
import { ERROR_CODES } from "../../constants.js";

async function listForPost({ viewerId, postId, cursor, limit }) {
  const lim = parseLimit(limit);
  const c = decodeCursor(cursor);
  const cursorTs = c ? c.createdAt : new Date("9999-12-31");
  const cursorId = c ? c.id : 0;

  const rows = await query(
    `
    SELECT
      c.id, c.post_id, c.author_id, c.parent_comment_id, c.content,
      c.like_count, c.reply_count, c.created_at,
      u.first_name, u.last_name, u.avatar_url,
      EXISTS(
        SELECT 1 FROM likes l
        WHERE l.user_id = ? AND l.target_type = 'comment' AND l.target_id = c.id
      ) AS liked_by_me
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.post_id = ? AND c.parent_comment_id IS NULL
      AND (c.created_at, c.id) < (?, ?)
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT ?
    `,
    [viewerId, postId, cursorTs, cursorId, lim + 1],
  );

  const hasNextPage = rows.length > lim;
  const items = (hasNextPage ? rows.slice(0, lim) : rows).map(serializeComment);
  const nextCursor = hasNextPage
    ? encodeCursor({
        createdAt: items[items.length - 1].created_at,
        id: items[items.length - 1].id,
      })
    : null;

  return { items, nextCursor };
}

async function listReplies({ viewerId, commentId, cursor, limit }) {
  const lim = parseLimit(limit);
  const c = decodeCursor(cursor);
  const cursorTs = c ? c.createdAt : new Date("9999-12-31");
  const cursorId = c ? c.id : 0;

  const rows = await query(
    `
    SELECT
      c.id, c.post_id, c.author_id, c.parent_comment_id, c.content,
      c.like_count, c.reply_count, c.created_at,
      u.first_name, u.last_name, u.avatar_url,
      EXISTS(
        SELECT 1 FROM likes l
        WHERE l.user_id = ? AND l.target_type = 'comment' AND l.target_id = c.id
      ) AS liked_by_me
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.parent_comment_id = ?
      AND (c.created_at, c.id) < (?, ?)
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT ?
    `,
    [viewerId, commentId, cursorTs, cursorId, lim + 1],
  );

  const hasNextPage = rows.length > lim;
  const items = (hasNextPage ? rows.slice(0, lim) : rows).map(serializeComment);
  const nextCursor = hasNextPage
    ? encodeCursor({
        createdAt: items[items.length - 1].created_at,
        id: items[items.length - 1].id,
      })
    : null;

  return { items, nextCursor };
}

async function create({ postId, authorId, content, parentCommentId }) {
  return withTransaction(async (conn) => {
    // Verify post exists.
    const [posts] = await conn.execute(
      "SELECT id FROM posts WHERE id = ? LIMIT 1",
      [postId],
    );
    if (!posts.length) {
      const err = new Error("Post not found");
      err.status = 404;
      throw err;
    }

    if (parentCommentId) {
      const [parents] = await conn.execute(
        "SELECT id, post_id, parent_comment_id FROM comments WHERE id = ? LIMIT 1",
        [parentCommentId],
      );
      if (
        !parents.length ||
        Number(parents[0].post_id) !== Number(postId) ||
        parents[0].parent_comment_id !== null
      ) {
        const err = new Error("Invalid parent comment");
        err.status = 400;
        throw err;
      }
    }

    const [insertResult] = await conn.execute(
      "INSERT INTO comments (post_id, author_id, parent_comment_id, content) VALUES (?, ?, ?, ?)",
      [postId, authorId, parentCommentId || null, content],
    );
    const newId = insertResult.insertId;

    if (parentCommentId) {
      await conn.execute(
        "UPDATE comments SET reply_count = reply_count + 1 WHERE id = ?",
        [parentCommentId],
      );
    } else {
      await conn.execute(
        "UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?",
        [postId],
      );
    }

    const [rows] = await conn.execute(
      `
      SELECT
        c.id, c.post_id, c.author_id, c.parent_comment_id, c.content,
        c.like_count, c.reply_count, c.created_at,
        u.first_name, u.last_name, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.id = ?
      LIMIT 1
      `,
      [newId],
    );
    return serializeComment({ ...rows[0], liked_by_me: 0 });
  });
}

async function remove(commentId) {
  await query("DELETE FROM comments WHERE id = ?", [commentId]);
}

function serializeComment(row) {
  return {
    id: Number(row.id),
    post_id: Number(row.post_id),
    parent_comment_id:
      row.parent_comment_id == null ? null : Number(row.parent_comment_id),
    author: {
      id: Number(row.author_id),
      first_name: row.first_name,
      last_name: row.last_name,
      avatar_url: row.avatar_url || null,
    },
    content: row.content,
    like_count: Number(row.like_count),
    reply_count: Number(row.reply_count),
    liked_by_me: Boolean(row.liked_by_me),
    created_at: row.created_at,
  };
}

function notFoundOrForbidden() {
  return createError(404, "Not found", { code: ERROR_CODES.NOT_FOUND });
}

const isCommentOwner = async (req, _res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return next(notFoundOrForbidden());

    const rows = await query(
      "SELECT author_id FROM comments WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows.length || Number(rows[0].author_id) !== Number(req.user.id)) {
      return next(
        createError(403, "You do not have permission to perform this action", {
          code: ERROR_CODES.FORBIDDEN,
        }),
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

export { listForPost, listReplies, create, remove, isCommentOwner };
