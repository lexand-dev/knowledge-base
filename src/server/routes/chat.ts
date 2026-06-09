import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createChatService } from "@/modules/chat";
import { createChatDbAdapter } from "@/modules/chat/adapter";

const chatAdapter = createChatDbAdapter();
const chatService = createChatService(chatAdapter);

export const chatRoutes = new Hono();

chatRoutes.get("/threads", async (c) => {
  const tenantId = 1; // TODO: Get from session
  const threads = await chatService.listTenantThreads(tenantId);
  return c.json(threads);
});

chatRoutes.post(
  "/threads",
  zValidator("json", z.object({ title: z.string() })),
  async (c) => {
    const { title } = c.req.valid("json");
    const tenantId = 1; // TODO: Get from session
    const thread = await chatService.createThread(tenantId, title);
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
    const { threadId, message } = c.req.valid("json");
    const tenantId = 1; // TODO: Get from session

    const responseParts: string[] = [];
    for await (const chunk of chatService.streamChat(tenantId, threadId, message)) {
      responseParts.push(chunk);
    }

    return c.json({ response: responseParts.join("") });
  }
);