import createError from 'http-errors';
import { verifyAccessToken } from '../lib/jwt.js';
import { query } from '../config/db.js';
import { ERROR_CODES } from '../constants.js';

const COOKIE_NAME = 'accessToken';

function extractToken(req) {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m ? m[1] : null;
}

export default async function authenticate(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw createError(401, 'Authentication required', { code: ERROR_CODES.UNAUTHORIZED });

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (_) {
      throw createError(401, 'Authentication required', { code: ERROR_CODES.UNAUTHORIZED });
    }

    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) {
      throw createError(401, 'Authentication required', { code: ERROR_CODES.UNAUTHORIZED });
    }

    const rows = await query(
      'SELECT id, first_name, last_name, email, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
      [userId],
    );
    if (!rows.length) {
      throw createError(401, 'Authentication required', { code: ERROR_CODES.UNAUTHORIZED });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};