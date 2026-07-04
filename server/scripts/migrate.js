import fs from "fs";
import { createHash } from "crypto";
import { join } from "path";

import "dotenv/config";
import mysql from "mysql2/promise";

import env from "../src/config/env.js";

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "migrations");

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function ensureLedger(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name        VARCHAR(255) NOT NULL PRIMARY KEY,
      checksum    CHAR(64)     NOT NULL,
      applied_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function run() {
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true,
  });

  try {
    await ensureLedger(conn);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const [rows] = await conn.query("SELECT name, checksum FROM _migrations");
    const applied = new Map(rows.map((r) => [r.name, r.checksum]));

    for (const [name, stored] of applied) {
      const filePath = join(MIGRATIONS_DIR, name);
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `Migration "${name}" was applied but the file is missing. ` +
            `Refusing to continue. Restore the file or delete the ledger row.`,
        );
      }
      const current = sha256(fs.readFileSync(filePath, "utf8"));
      if (current !== stored) {
        throw new Error(
          `Migration "${name}" has been modified after it was applied. ` +
            `Refusing to continue. Reverting requires a new migration.`,
        );
      }
    }

    let appliedCount = 0;
    for (const file of files) {
      const sql = fs.readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      const checksum = sha256(sql);

      if (applied.has(file)) {
        console.log(`skip   ${file}`);
        continue;
      }

      console.log(`apply  ${file}`);
      await conn.beginTransaction();
      try {
        await conn.query(sql);
        await conn.query(
          "INSERT INTO _migrations (name, checksum) VALUES (?, ?)",
          [file, checksum],
        );
        await conn.commit();
        appliedCount += 1;
      } catch (err) {
        await conn.rollback();
        throw new Error(
          `Migration "${file}" failed: ${err.message}. ` +
            `Transaction rolled back; ledger is unchanged.`,
        );
      }
    }

    console.log(
      appliedCount === 0
        ? "migrations: nothing to apply"
        : `migrations complete (${appliedCount} applied)`,
    );
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("migration failed:", err.message);
  process.exit(1);
});
