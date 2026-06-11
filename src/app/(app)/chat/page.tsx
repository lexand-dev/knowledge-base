"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface Thread {
  id: number;
  title: string;
  updatedAt: Date;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (diff < dayMs) return formatTime(date);
  if (diff < 7 * dayMs) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch("/api/chat/threads");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function fetchMessages(threadId: number): Promise<Message[]> {
  const res = await fetch(`/api/chat/threads/${threadId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function createThread(title: string): Promise<Thread> {
  const res = await fetch("/api/chat/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

async function deleteThread(id: number): Promise<void> {
  const res = await fetch(`/api/chat/threads/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const threads = await fetchThreads();
        setThreads(threads);
        if (threads.length > 0) {
          setSelectedThread(threads[0]);
        }
      } catch (err) {
        console.error("Failed to load threads:", err);
      } finally {
        setLoadingThreads(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedThread) return;
    const threadId = selectedThread.id;

    async function loadMessages() {
      try {
        const msgs = await fetchMessages(threadId);
        setMessages(msgs.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })));
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewThread = async () => {
    const title = `Chat ${new Date().toLocaleTimeString()}`;
    try {
      const thread = await createThread(title);
      setThreads(prev => [thread, ...prev]);
      setSelectedThread(thread);
    } catch (err) {
      console.error("Failed to create thread:", err);
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteThread(id);
      setThreads(prev => prev.filter(t => t.id !== id));
      if (selectedThread?.id === id) {
        setSelectedThread(null);
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedThread) return;
    const threadId = selectedThread.id;
    const messageText = input.trim();

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: messageText }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);
                if (event.type === "text") {
                  assistantContent += event.content;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                    }
                    return [...prev, {
                      id: Date.now(),
                      role: "assistant" as const,
                      content: assistantContent,
                      createdAt: new Date(),
                    }];
                  });
                }
              } catch { }
            }
          }
        }

        const msgs = await fetchMessages(selectedThread.id);
        setMessages(msgs.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })));
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#FAF9F7] dark:bg-[#0F0F0F]">
      <aside className="w-64 shrink-0 border-r border-[#E8E6E1] bg-white dark:border-[#262626] dark:bg-[#1A1A1A] flex flex-col">
        <div className="border-b border-[#E8E6E1] px-4 py-4 dark:border-[#262626]">
          <button
            onClick={handleNewThread}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D7377] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A5C5F]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
            </div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#6B6B6B]">
              No conversations yet
            </div>
          ) : (
            <div className="p-2">
              {threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`group relative flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selectedThread?.id === thread.id
                    ? "bg-[#F5F3EF] text-[#1a1a1a] dark:bg-[#262626] dark:text-[#FAFAFA]"
                    : "text-[#6B6B6B] hover:bg-[#F5F3EF]/50 dark:text-[#A3A3A3] dark:hover:bg-[#262626]/50"
                    }`}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="flex-1 truncate">{thread.title}</span>
                  <span className="text-xs text-[#6B6B6B]">
                    {formatDate(new Date(thread.updatedAt))}
                  </span>
                  <button
                    onClick={(e) => handleDeleteThread(e, thread.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-[#E8E6E1] group-hover:opacity-100 dark:hover:bg-[#333333]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        {selectedThread ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-6 py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 rounded-full bg-[#F5F3EF] p-4 dark:bg-[#1A1A1A]">
                      <svg className="h-8 w-8 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                      Start a conversation
                    </h3>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                      Ask questions about your documents
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div key={message.id}>
                        <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "user"
                            ? "bg-[#0D7377] text-white"
                            : "bg-[#F5F3EF] text-[#6B6B6B] dark:bg-[#262626] dark:text-[#A3A3A3]"
                            }`}>
                            {message.role === "user" ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                          </div>
                          <div className={`flex max-w-xl flex-col gap-1 ${message.role === "user" ? "items-end" : ""}`}>
                            <div className={`rounded-2xl px-4 py-2.5 ${message.role === "user"
                              ? "bg-[#0D7377] text-white"
                              : "bg-[#F5F3EF] text-[#1a1a1a] dark:bg-[#1A1A1A] dark:text-[#FAFAFA]"
                              }`}>
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            </div>
                            <span className="text-xs text-[#6B6B6B]">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F3EF] text-[#6B6B6B] dark:bg-[#262626] dark:text-[#A3A3A3]">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl bg-[#F5F3EF] px-4 py-3 dark:bg-[#1A1A1A]">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B6B6B] [animation-delay:0ms]" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B6B6B] [animation-delay:150ms]" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B6B6B] [animation-delay:300ms]" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-[#E8E6E1] bg-white p-4 dark:border-[#262626] dark:bg-[#1A1A1A]">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your documents..."
                    className="flex-1 resize-none rounded-xl border border-[#E8E6E1] bg-[#FAF9F7] px-4 py-3 text-sm placeholder:text-[#A3A3A3] focus:border-[#0D7377] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 dark:border-[#262626] dark:bg-[#0F0F0F] dark:placeholder:text-[#6B6B6B] dark:focus:border-[#14919B]"
                    rows={1}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D7377] text-white transition-colors hover:bg-[#0A5C5F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-[#6B6B6B]">
                  AI responses may contain inaccuracies. Verify important information.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-[#F5F3EF] p-6 dark:bg-[#1A1A1A]">
              <svg className="h-16 w-16 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-instrument)] text-2xl font-bold text-[#1a1a1a] dark:text-[#FAFAFA]">
              AI Knowledge Base
            </h2>
            <p className="mb-8 text-[#6B6B6B] dark:text-[#A3A3A3]">
              Select a conversation or start a new one
            </p>
            <button
              onClick={handleNewThread}
              className="flex items-center gap-2 rounded-xl bg-[#0D7377] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0A5C5F]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
