# Appify Feed

A small, production-deployed social-feed application: posts, comments, likes, image upload, and visibility controls. Built as a monorepo with two services — an Express + MySQL backend and a Next.js frontend — wired through JWT auth.

The goal was to ship something that is genuinely secure (rotating refresh tokens, scoped cookies, server-side input validation, rate limiting) while staying simple enough to deploy on Render in a few minutes.

---

## Repository layout

```
appify-feed/
├── server/   Express + MySQL backend (Node 18+, ESM)
└── web/      Next.js 16 frontend (App Router, React 19)
```

The two services are deployed independently (Render backend, Render/Vercel frontend). They communicate over HTTPS using JWT bearer tokens.

---

## Stack

### Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js 18+** (ESM) | Native ESM keeps the codebase consistent with modern JS conventions, no transpile step. |
| Framework | **Express 5** | Minimal, well-understood; the surface area is small enough that we don't need Nest/Fastify abstractions. |
| Database | **MySQL via `mysql2`** (TiDB Cloud in production) | TiDB Cloud is MySQL-compatible and free-tier friendly; `mysql2` is the fastest Node MySQL driver with first-class promise + pool support. |
| Validation | **Zod** | Schema-first validation that doubles as TypeScript-friendly types in JSDoc-typed code. Same schemas reused on the frontend. |
| Auth | **JWT (HS256) access + refresh** | Stateless access tokens for fast authorization; rotating refresh tokens stored hashed in DB for revocation. |
| Rate limiting | **`rate-limiter-flexible` backed by MySQL** | Shared, persistent counters survive deploys; no in-memory state lost between instances. |
| Image upload | **Multer → Cloudinary** | Offloads storage + CDN + image transforms. Multer handles the multipart parsing only; Cloudinary handles the rest. |
| Cookies | **`cookie-parser` + `httpOnly` + `SameSite=None; Secure`** | Auth cookies can travel cross-origin because the frontend and backend live on different subdomains. |
| Security headers | CORS with allow-listed origins | Origin locked to exact frontend URL, not a wildcard — credentials are safe. |

### Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server components for the auth gate, client components for everything interactive; file-based routing keeps the project structure flat. |
| UI runtime | **React 19** | Latest concurrent features; works cleanly with Next 16. |
| Data fetching | **TanStack Query (React Query)** | Cache, optimistic updates, and request deduplication out of the box. Each domain (posts, comments, likes, auth) has its own hook file. |
| Forms | **Formik + Zod via `zod-formik-adapter`** | Field-level errors before a request leaves the browser; Zod schemas are shared with the backend so the same validation runs on both sides. |
| Client state | **Zustand** | A tiny store for `useAuthStore` (user, isLoading) — everything else is server state via React Query. |
| HTTP | **Axios** with interceptors | One place to attach `Authorization: Bearer` and to handle 401 → refresh-and-retry. |
| Notifications | **react-toastify** | Non-blocking feedback for mutations. |
| Icons | **lucide-react** | Tree-shakable, consistent stroke weights. |

### Tooling

| Tool | Why |
|---|---|
| **pnpm 10** | Strict, fast, monorepo-friendly. Both `web/` and `server/` declare it as `packageManager`. |
| **ESLint (Next config)** | Catches obvious mistakes during development. |
| **dotenv** | 12-factor local config. Production uses Render environment variables directly — no `.env` file is shipped. |

---

## Architecture

```
┌────────────────────┐      Authorization: Bearer <jwt>      ┌─────────────────────┐
│  Next.js frontend  │  ───────────────────────────────────► │  Express backend    │
│  appify-feed-1     │                                       │  appify-feed        │
│  .onrender.com     │  ◄───────── JSON + Set-Cookie ──────  │  .onrender.com      │
└────────────────────┘                                       └──────────┬──────────┘
                                                                         │ TLS
                                                                         ▼
                                                              ┌─────────────────────┐
                                                              │  TiDB Cloud (MySQL) │
                                                              └─────────────────────┘
```

- **Auth transport.** The backend issues two tokens at login/register/refresh: an **access token** (15-minute TTL) and a **refresh token** (7-day TTL). The frontend stores them in `localStorage` and attaches `Authorization: Bearer <accessToken>` to every request, so every call is fully visible in Chrome DevTools under Network → Headers. The backend also sets `httpOnly` cookies for the same tokens as a defense-in-depth fallback. Either source is accepted by the `authenticate` middleware.
- **Token rotation.** Every `/api/auth/refresh` call revokes the presented refresh token (hash stored in `refresh_tokens`) and issues a fresh pair. Revoked tokens can't be reused.
- **CORS.** Locked to a configurable allow-list (`CLIENT_ORIGIN`, comma-separated). Preflight succeeds only for those origins; credentials are enabled.

---

## Local setup

### Prerequisites

- Node.js 18 or newer
- pnpm 10 (`npm i -g pnpm`)
- A MySQL 8 / TiDB instance (local docker, or a free TiDB Cloud cluster)

### 1. Clone and install

```bash
git clone https://github.com/Rafee1100/appify-feed.git
cd appify-feed
pnpm install                       # installs root + workspace tooling
```

### 2. Backend

```bash
cd server
cp .env.example .env               # fill in DB_*, JWT_*, CLIENT_ORIGIN, CLOUDINARY_*
pnpm install
pnpm run migrate                   # creates schema in your DB
pnpm run start                     # listens on PORT (default 4000)
```

`.env` keys you must set:

| Key | Notes |
|---|---|
| `CLIENT_ORIGIN` | Comma-separated. Include both `http://localhost:3000` and your production frontend URL. |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASS` / `DB_NAME` | Use `gateway…tidbcloud.com` style for TiDB Cloud. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` — must be different. |
| `CLOUDINARY_*` | Sign up at cloudinary.com and copy from the Console. Required for image upload. |

### 3. Frontend

```bash
cd ../web
cp .env.example .env.local         # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm install
pnpm run dev                       # http://localhost:3000
```

`.env.local` keys:

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | The backend URL. `NEXT_PUBLIC_*` is exposed to the browser. |

### 4. Try it

Open `http://localhost:3000`, register an account, post something with an image, like a post, reply to a comment. Every request shows up in DevTools → Network with its `Authorization: Bearer …` header.

---

## Deployment (Render)

The repo deploys as **two separate Render services** — one for `server/`, one for `web/`.

### Backend service

| Setting | Value |
|---|---|
| **Root Directory** | `server` |
| **Build Command** | `pnpm install` |
| **Start Command** | `pnpm run start` |
| **Health Check Path** | `/health` |

Environment variables (set in Render → Environment):

```
NODE_ENV=production
PORT=10000
CLIENT_ORIGIN=https://<your-frontend>.onrender.com
DB_HOST=…
DB_PORT=4000
DB_USER=…
DB_PASS=…
DB_NAME=…
JWT_ACCESS_SECRET=…
JWT_REFRESH_SECRET=…
ACCESS_TTL=15m
REFRESH_TTL=7d
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
```

After first deploy, run migrations once against the production DB from your local machine:

```bash
cd server
# point your local .env at the production DB temporarily
pnpm run migrate
```

### Frontend service

| Setting | Value |
|---|---|
| **Root Directory** | `web` |
| **Build Command** | `pnpm install && pnpm run build` |
| **Start Command** | `pnpm run start` |

Environment variables:

```
NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com
```

### TiDB Cloud notes

TiDB Cloud's Serverless tier requires TLS — `db.js` enables `ssl: { rejectUnauthorized: true }` so connections succeed out of the box. The migration script (`scripts/migrate.js`) carries the same setting, so you can run migrations against the production DB from your laptop without code changes.

---

## Optimization decisions

### 1. Auth transport — Bearer tokens + httpOnly cookie (hybrid)

Access and refresh tokens are returned in the JSON response body and attached as `Authorization: Bearer …` on every request. The backend also sets the same tokens as `httpOnly` cookies.

**Benefit:** Every request is fully visible in Chrome DevTools under Network → Headers, so debugging and external API consumers can `curl -H "Authorization: Bearer …"` and see exactly what the browser sees. The httpOnly cookie is a fallback — it stays out of JS reach, so a single XSS doesn't hand the token to an attacker for the lifetime of the cookie.

### 2. CORS — allow-list via `CLIENT_ORIGIN`

The backend reads a comma-separated list of allowed origins from the `CLIENT_ORIGIN` env var and the `cors` middleware only echoes back origins that match.

**Benefit:** The browser preflight succeeds only for known origins, and unexpected origins get an explicit 403. This is the only safe way to combine `Access-Control-Allow-Origin` with `Access-Control-Allow-Credentials: true` — wildcards aren't allowed by the spec.

### 3. State management — Zustand for auth, React Query for everything else

The current user and loading state live in a small Zustand store (`useAuthStore`). Posts, comments, likes, and the feed are all server state managed by TanStack Query.

**Benefit:** A single source of truth for server data means cache invalidation, optimistic updates, and request deduplication are handled in one place. The tiny Zustand store holds only the one piece of UI state that isn't already on the server, keeping the boundary clean.

### 4. Refresh tokens stored as SHA-256 hashes

Raw refresh tokens never touch the database — only the SHA-256 hash is stored in `refresh_tokens`. The auth middleware hashes incoming refresh tokens before lookup.

**Benefit:** A database leak doesn't grant attackers active sessions. Even full read access to the `refresh_tokens` table is useless without the corresponding raw token.

### 5. Rate limiter backed by MySQL

`rate-limiter-flexible` is configured with the same MySQL pool as the app, persisting counters in the `rate_limit` table.

**Benefit:** Counters survive deploys and work correctly across multiple instances. A brute-force attempt is throttled even if the server restarts mid-attack, which an in-memory limiter can't guarantee.

### 6. Validation on both server and frontend

The same Zod schemas are imported by the Express routes (via a `validate` middleware) and the Formik forms (via `zod-formik-adapter`).

**Benefit:** Backend validation is the security boundary — the client can never be trusted. Frontend validation gives instant field-level feedback before a request leaves the browser, and because the schemas are shared there's no risk of the two sides drifting apart.

### 7. Image upload to Cloudinary

Posts with images are uploaded through Multer (for multipart parsing) and then streamed to Cloudinary, which returns a CDN URL stored in the post row.

**Benefit:** Render's filesystem is ephemeral — uploads stored locally disappear on every redeploy. Cloudinary gives durable storage, a global CDN, and on-the-fly image transforms (resize, format conversion) without writing image-processing code.

### 8. Cursor-based pagination for the feed, comments, and likes

The feed, comment thread, and likes modal all use keyset (cursor) pagination. The cursor is an opaque base64 string carrying the last seen `id` and `created_at`.

**Benefit:** Cursor pagination is `O(log n)` on the indexed column and stays consistent when rows are inserted or removed — unlike offset pagination, which skips or duplicates rows as the underlying data shifts.

### 9. Next.js App Router

The frontend uses the App Router (not the legacy Pages Router) with server components for the auth-gate layout and client components for everything interactive.

**Benefit:** Server components let the auth gate live on the server, so the redirect-to-login logic never ships to the browser. Streaming and partial rendering come for free with the same mental model.

### 10. Direct backend fetch (no Next.js proxy)

The frontend's `httpServices.js` calls `${NEXT_PUBLIC_API_URL}/api/...` directly. There is no Next.js catch-all route forwarding to the backend.

**Benefit:** Every request is one-to-one in DevTools, with the real backend hostname in the URL. The frontend can be deployed to any host (Render, Vercel, Netlify, custom) by changing one env var, with no proxy layer to keep in sync.

---

## What's intentionally not built

- **Edit post / edit comment** — no PATCH route on the backend; UI option removed.
- **Comment delete UI** — the hook existed, had no consumers; removed during cleanup.
- **Realtime updates** — likes, comments, and new posts don't broadcast across tabs. Re-validation happens on focus. Adding WebSockets or SSE is a natural next step.
- **Notifications, search, friends, explore, events APIs** — the corresponding UI sections render from `mockData/` only; wiring them to real endpoints is straightforward when needed.

---
