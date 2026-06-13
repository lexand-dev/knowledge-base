import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { authMiddleware, requireAuth, type AuthVariables } from "@/features/auth/middleware";

const mockUser = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
};

vi.mock("@/features/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
    handler: vi.fn(),
  },
}));

import { auth } from "@/features/auth/auth";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockHandler = vi.mocked(auth.handler);

beforeEach(() => {
  vi.resetAllMocks();
  mockHandler.mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  );
});

describe("authMiddleware", () => {
  it("sets user context when session exists", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "1", email: "test@example.com", name: "Test User" },
      session: { id: "s1", userId: "1", token: "tok", expiresAt: new Date() },
    } as never);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", (c) => c.json(c.get("user")));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockUser);
  });

  it("sets user context to null when no session", async () => {
    mockGetSession.mockResolvedValue(null);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", (c) => c.json(c.get("user")));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("defaults missing name", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "2", email: "new@test.com", name: null },
      session: { id: "s2", userId: "2", token: "tok", expiresAt: new Date() },
    } as never);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", (c) => c.json(c.get("user")));

    const res = await app.request("/test");
    expect(await res.json()).toMatchObject({
      id: "2",
      email: "new@test.com",
      name: "",
    });
  });
});

describe("requireAuth", () => {
  it("returns 401 when user is null", async () => {
    const app = new Hono<{ Variables: AuthVariables }>()
      .get("/test", requireAuth, (c) => c.json({ ok: true }));

    const res = await app.request("/test");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("allows request when user is set", async () => {
    const app = new Hono<{ Variables: AuthVariables }>()
      .get("/test", async (c, next) => {
        c.set("user", mockUser);
        await next();
      }, requireAuth, (c) => c.json({ ok: true }));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe("auth session routes", () => {
  it("middleware sets user when session exists", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "1", email: "test@example.com", name: "Test User" },
      session: { id: "s1", userId: "1", token: "tok", expiresAt: new Date() },
    } as never);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", (c) => c.json(c.get("user")));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: "1",
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("middleware returns null when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", (c) => c.json(c.get("user")));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("requireAuth returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", requireAuth, (c) => c.json({ ok: true }));

    const res = await app.request("/test");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("requireAuth allows when authenticated", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "5", email: "user@test.com", name: "Alice" },
      session: { id: "s5", userId: "5", token: "tok", expiresAt: new Date() },
    } as never);

    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/test", requireAuth, (c) => c.json({ id: c.get("user")!.id }));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "5" });
  });
});

describe("full app routing", () => {
  it("health check is public (no auth required)", async () => {
    const { app } = await import("@/app/api/[[...route]]/route");

    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });

  it("unauth /api/documents returns 401 via requireAuth middleware", async () => {
    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/api/documents", requireAuth, (c) => c.json({ ok: true }));

    mockGetSession.mockResolvedValue(null);

    const res = await app.request("/api/documents");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("unauth /api/chat returns 401 via requireAuth middleware", async () => {
    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/api/chat/threads", requireAuth, (c) => c.json({ ok: true }));

    mockGetSession.mockResolvedValue(null);

    const res = await app.request("/api/chat/threads");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("auth + requireAuth chain protects routes", async () => {
    const app = new Hono<{ Variables: AuthVariables }>()
      .use(authMiddleware)
      .get("/api/data", requireAuth, (c) => c.json({ data: "ok" }));

    mockGetSession.mockResolvedValue(null);
    let res = await app.request("/api/data");
    expect(res.status).toBe(401);

    mockGetSession.mockResolvedValue({
      user: { id: "1", email: "a@b.com", name: "Test" },
      session: { id: "s", userId: "1", token: "t", expiresAt: new Date() },
    } as never);
    res = await app.request("/api/data");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: "ok" });
  });
});
