import createError from 'http-errors';
import { verifyAccessToken } from '../lib/jwt.js';
import { query } from '../config/db.js';
import { ERROR_CODES } from '../constants.js';

const COOKIE_NAME = 'accessToken';

export default async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
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