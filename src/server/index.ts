import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiEnv } from "./types";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";

const app = new Hono<{ Bindings: ApiEnv }>()
  .use(logger())
  .use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  )
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  );

export const routes = app
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/documents", documentRoutes)
  .route("/chat", chatRoutes);

export type ApiRoutes = typeof routes;