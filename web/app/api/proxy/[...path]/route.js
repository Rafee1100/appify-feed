import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getBackendOrigin() {
  const direct = process.env.BACKEND_URL?.trim();
  if (direct) return direct.replace(/\/+$/, "");

  const legacy = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (legacy) return legacy.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  // Dev default: assume the backend is on localhost:4000.
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:4000";
  }

  return "";
}

function getAllowedOrigins(req) {
  const allowed = new Set([req.nextUrl.origin]);
  const extra = process.env.CSRF_ALLOWED_ORIGINS?.trim();
  if (extra) {
    for (const o of extra.split(",").map((s) => s.trim()).filter(Boolean)) {
      allowed.add(o);
    }
  }
  return allowed;
}

function getRequestOrigin(req) {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const referer = req.headers.get("referer");
  if (!referer) return null;
  try {
    const u = new URL(referer);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

async function handler(req, paramsPromise) {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return NextResponse.json(
      {
        message:
          "Proxy misconfigured: set BACKEND_URL (e.g. https://<render-app>.onrender.com)",
      },
      { status: 500 }
    );
  }

  const method = req.method.toUpperCase();

  if (!SAFE_METHODS.has(method)) {
    const requestOrigin = getRequestOrigin(req);
    const allowed = getAllowedOrigins(req);
    if (!requestOrigin || !allowed.has(requestOrigin)) {
      return NextResponse.json(
        { message: "Cross-origin requests are not allowed." },
        { status: 403 }
      );
    }
  }

  const { path } = await paramsPromise;
  const upstreamUrl = new URL(`${backendOrigin}/api/${path.join("/")}`);
  upstreamUrl.search = req.nextUrl.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers();
  const resContentType = upstreamRes.headers.get("content-type");
  if (resContentType) resHeaders.set("content-type", resContentType);

  const getSetCookie = upstreamRes.headers.getSetCookie?.bind(
    upstreamRes.headers
  );
  const setCookies =
    typeof getSetCookie === "function" ? getSetCookie() : [];
  if (setCookies.length) {
    for (const c of setCookies) resHeaders.append("set-cookie", c);
  } else {
    const single = upstreamRes.headers.get("set-cookie");
    if (single) resHeaders.set("set-cookie", single);
  }

  const buf = await upstreamRes.arrayBuffer();
  return new NextResponse(buf, {
    status: upstreamRes.status,
    headers: resHeaders,
  });
}

export const GET = (req, ctx) => handler(req, ctx.params);
export const POST = (req, ctx) => handler(req, ctx.params);
export const PUT = (req, ctx) => handler(req, ctx.params);
export const PATCH = (req, ctx) => handler(req, ctx.params);
export const DELETE = (req, ctx) => handler(req, ctx.params);