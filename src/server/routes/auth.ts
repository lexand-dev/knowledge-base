import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/lib/auth";

export const authRoutes = new Hono();

async function proxyToBetterAuth(c: Context, path: string) {
  const method = c.req.method;
  const headers = new Headers(c.req.header());

  const request = new Request(`http://localhost/api/auth/${path}`, {
    method,
    headers,
    body: method !== "GET" && method !== "HEAD" ? await c.req.raw.text() : undefined,
  });

  const response = await auth.handler(request);

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    c.header("Set-Cookie", setCookie);
  }

  const contentType = response.headers.get("content-type");
  const body = await response.text();

  if (contentType?.includes("application/json")) {
    try {
      return c.json(JSON.parse(body), response.status as 200 | 201 | 400 | 401 | 403 | 404 | 500);
    } catch {
      return c.text(body, response.status as 200 | 201 | 400 | 401 | 403 | 404 | 500);
    }
  }

  return c.text(body, response.status as 200 | 201 | 400 | 401 | 403 | 404 | 500);
}

authRoutes.all("/:path(*)", async (c) => proxyToBetterAuth(c, c.req.param("path") ?? ""));

authRoutes.post(
  "/signin",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => proxyToBetterAuth(c, "sign-in/email")
);

authRoutes.post(
  "/signup",
  zValidator("json", z.object({ email: z.string().email(), name: z.string().min(1) })),
  async (c) => proxyToBetterAuth(c, "sign-up/email")
);

authRoutes.post("/signout", async (c) => proxyToBetterAuth(c, "sign-out"));

authRoutes.get("/session", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ user: null, tenantId: null });
  }

  return c.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    tenantId: (session.user as Record<string, unknown>).tenantId ?? null,
  });
});

authRoutes.get("/user", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    tenantId: (session.user as Record<string, unknown>).tenantId ?? null,
  });
});