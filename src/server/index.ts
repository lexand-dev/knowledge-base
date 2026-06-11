import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";
import { auth } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";

export const app = new Hono().basePath('/api')
  .use(logger())
  .use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .use(authMiddleware)
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .route("/documents", documentRoutes)
  .route("/chat", chatRoutes);

export type AppType = typeof app;
