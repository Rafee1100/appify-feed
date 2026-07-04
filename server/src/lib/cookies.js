import env from "../config/env.js";

const isProd = env.NODE_ENV === "production";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: maxAgeMs,
});

const REFRESH_COOKIE_PATH = "/api/auth";

function refreshCookieOptions(maxAgeMs) {
  return { ...cookieOptions(maxAgeMs), path: REFRESH_COOKIE_PATH };
}

function ttlToMs(ttl) {
  if (typeof ttl === "number") return ttl * 1000;
  const m = /^(\d+)([smhd])$/.exec(String(ttl).trim());
  if (!m) return 15 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2];
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
}

export { cookieOptions, refreshCookieOptions, ttlToMs, REFRESH_COOKIE_PATH };
