import { Hono } from "hono";
import { authMiddleware, requireAuth, type AuthVariables } from "@/middleware/auth";

export const authRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(authMiddleware)
  .get("/session", (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ user: null });
    }
    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  })
  .get("/user", requireAuth, (c) => {
    const user = c.get("user")!;
    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  });
