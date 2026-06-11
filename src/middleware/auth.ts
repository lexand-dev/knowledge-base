import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

export interface AuthVariables {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  session: typeof auth.$Infer.Session.session | null;
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("user", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? "",
    });
    c.set("session", session.session);
  } else {
    c.set("user", null);
    c.set("session", null);
  }

  await next();
});

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
