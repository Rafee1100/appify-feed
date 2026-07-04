import createError from "http-errors";
import { query, withTransaction } from "../../config/db.js";
import { hash, compare } from "../../lib/password.js";
import env from "../../config/env.js";
import { ERROR_CODES } from "../../constants.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt.js";
import {
  cookieOptions,
  refreshCookieOptions,
  ttlToMs,
} from "../../lib/cookies.js";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

const GENERIC_AUTH_ERROR = createError(401, "Invalid email or password", {
  code: ERROR_CODES.UNAUTHORIZED,
});

const GENERIC_REGISTER_ERROR = createError(
  409,
  "Unable to create account with those details",
  {
    code: ERROR_CODES.CONFLICT,
  },
);

function publicUser(u) {
  return {
    id: Number(u.id),
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    avatar_url: u.avatar_url || null,
    created_at: u.created_at,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(
    ACCESS_COOKIE,
    accessToken,
    cookieOptions(ttlToMs(env.ACCESS_TTL)),
  );
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    refreshCookieOptions(ttlToMs(env.REFRESH_TTL)),
  );
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

async function register({ first_name, last_name, email, password: plain }) {
  const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  if (existing.length) throw GENERIC_REGISTER_ERROR;

  const passwordHash = await hash(plain);

  let userId;
  try {
    const result = await query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, passwordHash],
    );
    userId = result.insertId;
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") throw GENERIC_REGISTER_ERROR;
    throw err;
  }

  const user = (
    await query(
      "SELECT id, first_name, last_name, email, avatar_url, created_at FROM users WHERE id = ? LIMIT 1",
      [userId],
    )
  )[0];

  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  const expiresAt = new Date(refresh.exp * 1000);
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?)",
    [user.id, hashToken(refresh.token), null, null, expiresAt],
  );

  return {
    user: publicUser(user),
    accessToken: access.token,
    refreshToken: refresh.token,
  };
}

async function login({ email, password: plain }) {
  const rows = await query(
    "SELECT id, first_name, last_name, email, password_hash, avatar_url, created_at FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  const user = rows[0];

  const dummy = "$2b$12$0000000000000000000000000000000000000000000000000000";
  const hashToCompare = user ? user.password_hash : dummy;
  const ok = await compare(plain, hashToCompare);

  if (!user || !ok) throw GENERIC_AUTH_ERROR;

  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  const expiresAt = new Date(refresh.exp * 1000);
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?)",
    [user.id, hashToken(refresh.token), null, null, expiresAt],
  );

  return {
    user: publicUser(user),
    accessToken: access.token,
    refreshToken: refresh.token,
  };
}

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw createError(401, "Authentication required", {
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (_) {
    throw createError(401, "Authentication required", {
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }

  const userId = Number(payload.sub);
  const tokenHash = hashToken(rawRefreshToken);

  const result = await withTransaction(async (conn) => {
    const [rows] = await conn.execute(
      "SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
      [tokenHash],
    );
    if (!rows.length) {
      throw createError(401, "Authentication required", {
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    const row = rows[0];
    if (row.revoked_at) {
      throw createError(401, "Authentication required", {
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      throw createError(401, "Authentication required", {
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    const [users] = await conn.execute(
      "SELECT id, first_name, last_name, email, avatar_url, created_at FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    if (!users.length) {
      throw createError(401, "Authentication required", {
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    await conn.execute(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?",
      [row.id],
    );

    const user = users[0];
    const access = signAccessToken(user);
    const refreshNew = signRefreshToken(user);

    const expiresAt = new Date(refreshNew.exp * 1000);
    await conn.execute(
      "INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip, expires_at) VALUES (?, ?, ?, ?, ?)",
      [user.id, hashToken(refreshNew.token), null, null, expiresAt],
    );

    return {
      user: publicUser(user),
      accessToken: access.token,
      refreshToken: refreshNew.token,
    };
  });

  return result;
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await query(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL",
    [tokenHash],
  );
}

export { register, login, refresh, logout, setAuthCookies, clearAuthCookies };
