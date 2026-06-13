import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";
import documents from "./documents";
import chat from "./chat";
import upload from "./upload";
import { auth } from "@/features/auth";
import { authMiddleware } from "@/features/auth/middleware";

export const runtime = "nodejs";

const app = new Hono().basePath("/api")
  .use(logger())
  .use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .use(authMiddleware)
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .route("/documents", documents)
  .route("/chat", chat)
  .route("/upload", upload);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof app;

export { app };
