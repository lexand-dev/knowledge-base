import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createChatService } from "@/modules/chat";
import { createChatDbAdapter } from "@/modules/chat/adapter";
import type { AuthVariables } from "@/middleware/auth";

const chatAdapter = createChatDbAdapter();
const chatService = createChatService(chatAdapter);

export const chatRoutes = new Hono<{ Variables: AuthVariables }>();

chatRoutes.get("/threads", async (c) => {
  const user = c.get("user");
  if (!user?.tenantId) {
    return c.json({ error: "Tenant required" }, 403);
  }
  const threads = await chatService.listTenantThreads(user.tenantId);
  return c.json(threads);
});

chatRoutes.post(
  "/threads",
  zValidator("json", z.object({ title: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!user?.tenantId) {
      return c.json({ error: "Tenant required" }, 403);
    }
    const { title } = c.req.valid("json");
    const thread = await chatService.createThread(user.tenantId, title);
    return c.json(thread, 201);
  }
);

chatRoutes.get("/threads/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const thread = await chatService.getThread(id);
  if (!thread) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(thread);
});

chatRoutes.delete("/threads/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await chatService.removeThread(id);
  return c.json({ success: true, id });
});

chatRoutes.get("/threads/:id/messages", async (c) => {
  const threadId = parseInt(c.req.param("id"));
  const messages = await chatService.getThreadMessages(threadId);
  return c.json(messages);
});

chatRoutes.post(
  "/chat",
  zValidator("json", z.object({ threadId: z.number(), message: z.string() })),
  async (c) => {
    const user = c.get("user");
    if (!user?.tenantId) {
      return c.json({ error: "Tenant required" }, 403);
    }
    const { threadId, message } = c.req.valid("json");

    const responseParts: string[] = [];
    for await (const chunk of chatService.streamChat(user.tenantId, threadId, message)) {
      responseParts.push(chunk);
    }

    return c.json({ response: responseParts.join("") });
  }
);