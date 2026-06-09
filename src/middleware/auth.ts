import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

export interface AuthVariables {
  user: {
    id: number;
    email: string;
    name: string;
    tenantId: number | null;
    role: string;
  } | null;
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("user", {
      id: Number(session.user.id),
      email: session.user.email,
      name: session.user.name ?? "",
      tenantId: (session.user as Record<string, unknown>).tenantId as number | null ?? null,
      role: (session.user as Record<string, unknown>).role as string ?? "member",
    });
  } else {
    c.set("user", null);
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

export const requireTenant = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get("user");
  if (!user?.tenantId) {
    return c.json({ error: "Tenant required" }, 403);
  }
  await next();
});