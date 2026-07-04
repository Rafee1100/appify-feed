import fs from "fs";
import { join } from "path";
import crypto from "crypto";

import "dotenv/config";

const ENV_FILE = join(import.meta.dirname, "..", "..", ".env");

function requiredValue(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function optionalValue(name, fallback) {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

const optional = optionalValue;
const required = requiredValue;

function loadOrCreateSecret(name) {
  const existing = process.env[name];
  if (existing && existing.trim() !== "") return existing;

  const secret = crypto.randomBytes(48).toString("hex");
  let current = "";
  try {
    current = fs.readFileSync(ENV_FILE, "utf-8");
  } catch (error) {
    console.error(`Error reading environment file: ${error.message}`);
    process.exit(1);
  }
  try {
    fs.writeFileSync(ENV_FILE, current + `\n${name}=${secret}\n`, {
      mode: 0o600,
    });
  } catch (err) {
    console.error(`Failed to persist ${name} to ${ENV_FILE}:`, err.message);
    process.exit(1);
  }
  process.env[name] = secret;
  console.warn(
    `[env] Generated ${name} and appended it to ${ENV_FILE}. ` +
      `Treat this value as sensitive — rotate by replacing it and restarting.`,
  );
  return secret;
}

const JWT_ACCESS_SECRET = loadOrCreateSecret("JWT_ACCESS_SECRET");
const JWT_REFRESH_SECRET = loadOrCreateSecret("JWT_REFRESH_SECRET");

if (JWT_ACCESS_SECRET === JWT_REFRESH_SECRET) {
  console.error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  process.exit(1);
}

const env = Object.freeze({
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "4000")),
  CLIENT_ORIGIN: required("CLIENT_ORIGIN"),

  DB_HOST: required("DB_HOST"),
  DB_PORT: Number(required("DB_PORT")),
  DB_USER: required("DB_USER"),
  DB_PASS: required("DB_PASS"),
  DB_NAME: required("DB_NAME"),

  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TTL: optional("ACCESS_TTL", "15m"),
  REFRESH_TTL: optional("REFRESH_TTL", "7d"),

  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET", ""),

  UPLOAD_MAX_MB: Number(optional("UPLOAD_MAX_MB", "5")),
});

export default env;
