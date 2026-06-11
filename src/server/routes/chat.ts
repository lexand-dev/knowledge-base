import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamSSE } from "hono/streaming";
import { createChatService } from "@/modules/chat";
import { createChatDbAdapter } from "@/modules/chat/adapter";
import { requireAuth, type AuthVariables } from "@/middleware/auth";

const chatAdapter = createChatDbAdapter();
const chatService = createChatService(chatAdapter);

export const chatRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/threads", async (c) => {
    const user = c.get("user")!;
    const threads = await chatService.listThreads(user.id);
    return c.json(threads);
  })
  .post("/threads",
    zValidator("json", z.object({ title: z.string() })),
    async (c) => {
      const user = c.get("user")!;
      const { title } = c.req.valid("json");
      const thread = await chatService.createThread(user.id, title);
      return c.json(thread, 201);
    }
  )
  .get("/threads/:id", async (c) => {
    const id = c.req.param("id");
    const thread = await chatService.getThread(id);
    if (!thread) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(thread);
  })
  .delete("/threads/:id", async (c) => {
    const id = c.req.param("id");
    await chatService.removeThread(id);
    return c.json({ success: true, id });
  })
  .get("/threads/:id/messages", async (c) => {
    const threadId = c.req.param("id");
    const messages = await chatService.getThreadMessages(threadId);
    return c.json(messages);
  })
  .post("/",
    zValidator("json", z.object({ threadId: z.string(), message: z.string() })),
    async (c) => {
      const user = c.get("user")!;
      const { threadId, message } = c.req.valid("json");

      return streamSSE(c, async (stream) => {
        for await (const event of chatService.streamChat(user.id, threadId, message)) {
          await stream.writeSSE({
            data: JSON.stringify(event),
          });
        }
      }, async (err, stream) => {
        console.error("Chat stream error:", err);
        await stream.writeSSE({
          data: JSON.stringify({ type: "error", content: err instanceof Error ? err.message : "Stream error" }),
        });
      });
    }
  );
