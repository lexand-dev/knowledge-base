import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiEnv } from "./types";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";
import { authMiddleware, requireAuth, type AuthVariables } from "@/middleware/auth";

type AppVariables = AuthVariables;

export const app = new Hono<{ Bindings: ApiEnv; Variables: AppVariables }>()
  .use(logger())
  .use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    })
  )
  .get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() })
  )
  .route("/api/auth", authRoutes)
  .route("/api/documents", documentRoutes.use(authMiddleware, requireAuth))
  .route("/api/chat", chatRoutes.use(authMiddleware, requireAuth));

export type ApiRoutes = typeof app;