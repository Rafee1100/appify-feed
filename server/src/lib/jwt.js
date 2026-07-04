import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

function generateJti() {
  return crypto.randomBytes(16).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user) {
  const jti = generateJti();
  const token = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      jwtid: jti,
      expiresIn: env.ACCESS_TTL,
    },
  );
  return { token, jti };
}

function signRefreshToken(user) {
  const jti = generateJti();
  const token = jwt.sign(
    { sub: String(user.id), type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { jwtid: jti, expiresIn: env.REFRESH_TTL },
  );
  const decoded = jwt.decode(token);
  const exp = decoded.exp;
  return { token, jti, exp };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export {
  generateJti,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
