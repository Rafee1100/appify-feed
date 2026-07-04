import { query, withTransaction } from "../../config/db.js";
import { encodeCursor, decodeCursor, parseLimit } from "../../lib/cursor.js";
import { TARGET_TYPE } from "../../constants.js";

async function toggle({ userId, targetType, targetId }) {
  return withTransaction(async (conn) => {
    const [existing] = await conn.execute(
      "SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ? LIMIT 1",
      [userId, targetType, targetId],
    );

    const counterColumn =
      targetType === TARGET_TYPE.POST ? "posts" : "comments";
    const idColumn = "id";

    if (existing.length) {
      await conn.execute("DELETE FROM likes WHERE id = ?", [existing[0].id]);
      await conn.execute(
        `UPDATE ${counterColumn} SET like_count = like_count - 1 WHERE ${idColumn} = ?`,
        [targetId],
      );
      const [[row]] = await conn.execute(
        `SELECT like_count FROM ${counterColumn} WHERE ${idColumn} = ? LIMIT 1`,
        [targetId],
      );
      return { liked: false, like_count: Number(row.like_count) };
    }

    const [targetRows] = await conn.execute(
      `SELECT id FROM ${counterColumn} WHERE id = ? LIMIT 1`,
      [targetId],
    );
    if (!targetRows.length) {
      const err = new Error("Target not found");
      err.status = 404;
      throw err;
    }

    await conn.execute(
      "INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)",
      [userId, targetType, targetId],
    );
    await conn.execute(
      `UPDATE ${counterColumn} SET like_count = like_count + 1 WHERE ${idColumn} = ?`,
      [targetId],
    );
    const [[row]] = await conn.execute(
      `SELECT like_count FROM ${counterColumn} WHERE ${idColumn} = ? LIMIT 1`,
      [targetId],
    );
    return { liked: true, like_count: Number(row.like_count) };
  });
}

async function listLikers({ targetType, targetId, cursor, limit }) {
  const lim = parseLimit(limit, 50);
  const c = decodeCursor(cursor);
  const cursorTs = c ? c.createdAt : new Date("9999-12-31");
  const cursorId = c ? c.id : 0;

  const rows = await query(
    `
    SELECT
      u.id, u.first_name, u.last_name, u.avatar_url, l.created_at
    FROM likes l
    JOIN users u ON u.id = l.user_id
    WHERE l.target_type = ? AND l.target_id = ?
      AND (l.created_at, l.id) < (?, ?)
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT ?
    `,
    [targetType, targetId, cursorTs, cursorId, lim + 1],
  );

  const hasNextPage = rows.length > lim;
  const items = (hasNextPage ? rows.slice(0, lim) : rows).map((r) => ({
    id: Number(r.id),
    first_name: r.first_name,
    last_name: r.last_name,
    avatar_url: r.avatar_url || null,
    liked_at: r.created_at,
  }));
  const nextCursor = hasNextPage
    ? encodeCursor({
        createdAt: items[items.length - 1].liked_at,
        id: items[items.length - 1].id,
      })
    : null;

  return { items, nextCursor };
}

export { toggle, listLikers };
