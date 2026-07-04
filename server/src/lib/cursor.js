function encodeCursor({ createdAt, id }) {
  const payload = JSON.stringify({
    t: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
    i: Number(id),
  });
  return Buffer.from(payload).toString("base64url");
}

function decodeCursor(rawCursor) {
  if (!rawCursor) return null;
  try {
    const jsonData = Buffer.from(String(rawCursor), "base64url").toString("utf8");
    const { t, i } = JSON.parse(jsonData);
    if (!t || !i) return null;
    const createdAt = new Date(t);
    if (Number.isNaN(createdAt.getTime())) return null;
    const id = Number(i);
    if (!Number.isFinite(id) || id <= 0) return null;
    return { createdAt, id };
  } catch (_) {
    return null;
  }
}

function parseLimit(raw, fallback = 20, max = 50) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export { encodeCursor, decodeCursor, parseLimit };
