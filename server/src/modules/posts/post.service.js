import createError from "http-errors";
import { query } from "../../config/db.js";
import { uploadBuffer } from "../../config/cloudinary.js";
import { encodeCursor, decodeCursor, parseLimit } from "../../lib/cursor.js";
import { VISIBILITY, ERROR_CODES } from "../../constants.js";


async function listFeed({ viewerId, cursor, limit }) {
  const lim = parseLimit(limit);
  const c = decodeCursor(cursor);
  const cursorTs = c ? c.createdAt : new Date("9999-12-31");
  const cursorId = c ? c.id : 0;

  const sql = `
    SELECT
      p.id, p.author_id, p.content, p.image_url, p.visibility,
      p.like_count, p.comment_count, p.created_at,
      u.first_name, u.last_name, u.avatar_url,
      EXISTS(
        SELECT 1 FROM likes l
        WHERE l.user_id = ? AND l.target_type = 'post' AND l.target_id = p.id
      ) AS liked_by_me
    FROM posts p
    JOIN users u ON u.id = p.author_id
    WHERE (p.visibility = ? OR p.author_id = ?)
      AND (p.created_at, p.id) < (?, ?)
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ?
  `;
  const rows = await query(sql, [
    viewerId,
    VISIBILITY.PUBLIC,
    viewerId,
    cursorTs,
    cursorId,
    lim + 1,
  ]);

  const hasNextPage = rows.length > lim;
  const items = (hasNextPage ? rows.slice(0, lim) : rows).map(serializePost);

  const nextCursor = hasNextPage
    ? encodeCursor({
        createdAt: items[items.length - 1].created_at,
        id: items[items.length - 1].id,
      })
    : null;

  return { items, nextCursor };
}

async function getById({ viewerId, postId }) {
  const rows = await query(
    `
    SELECT
      p.id, p.author_id, p.content, p.image_url, p.visibility,
      p.like_count, p.comment_count, p.created_at,
      u.first_name, u.last_name, u.avatar_url,
      EXISTS(
        SELECT 1 FROM likes l
        WHERE l.user_id = ? AND l.target_type = 'post' AND l.target_id = p.id
      ) AS liked_by_me
    FROM posts p
    JOIN users u ON u.id = p.author_id
    WHERE p.id = ?
    LIMIT 1
    `,
    [viewerId, postId],
  );
  if (!rows.length) return null;
  return serializePost(rows[0]);
}

async function create({ authorId, content, visibility, imageBuffer }) {
  let imageUrl = null;
  if (imageBuffer) {
    const { url } = await uploadBuffer(imageBuffer, "social-feed/posts");
    imageUrl = url;
  }

  const result = await query(
    "INSERT INTO posts (author_id, content, image_url, visibility) VALUES (?, ?, ?, ?)",
    [authorId, content, imageUrl, visibility],
  );
  const id = result.insertId;
  return getById({ viewerId: authorId, postId: id });
}

async function remove(postId) {
  await query("DELETE FROM posts WHERE id = ?", [postId]);
}

function serializePost(row) {
  return {
    id: Number(row.id),
    author: {
      id: Number(row.author_id),
      first_name: row.first_name,
      last_name: row.last_name,
      avatar_url: row.avatar_url || null,
    },
    content: row.content,
    image_url: row.image_url || null,
    visibility: row.visibility,
    like_count: Number(row.like_count),
    comment_count: Number(row.comment_count),
    liked_by_me: Boolean(row.liked_by_me),
    created_at: row.created_at,
  };
}

function notFoundOrForbidden() {
  return createError(404, "Not found", { code: ERROR_CODES.NOT_FOUND });
}

const isPostOwner = async (req, _res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return next(notFoundOrForbidden());

    const rows = await query(
      "SELECT author_id FROM posts WHERE id = ? LIMIT 1",
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


const canViewPrivatePost = async (req, _res, next) => {
  try {
    // Accept either `:id` (when used standalone on /api/posts/:id)
    // or `:postId` (when used nested under /api/posts/:postId/comments).
    const id = Number(req.params.id ?? req.params.postId);
    if (!Number.isFinite(id)) return next(notFoundOrForbidden());

    const rows = await query(
      "SELECT author_id, visibility FROM posts WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows.length) return next(notFoundOrForbidden());

    const isOwner = Number(rows[0].author_id) === Number(req.user.id);
    const isPublic = rows[0].visibility === VISIBILITY.PUBLIC;
    if (!isPublic && !isOwner) return next(notFoundOrForbidden());

    next();
  } catch (err) {
    next(err);
  }
};

export { listFeed, getById, create, remove, isPostOwner, canViewPrivatePost };
