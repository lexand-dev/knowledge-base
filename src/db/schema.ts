import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  index,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const documentStatusEnum = pgEnum("document_status", [
  "uploading",
  "processing",
  "ready",
  "failed",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 255 }).notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer("size").notNull(),
    status: documentStatusEnum("status")
      .notNull()
      .default("uploading"),
    errorMessage: text("error_message"),
    chunkCount: integer("chunk_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("documents_user_id_idx").on(table.userId),
    statusIdx: index("documents_status_idx").on(table.status),
  })
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(), // 1024 dims = Cohere embed-multilingual-v3.0 output
    pageNumber: integer("page_number"),
    chunkIndex: integer("chunk_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    documentIdIdx: index("document_chunks_document_id_idx").on(
      table.documentId
    ),
    userIdIdx: index("document_chunks_user_id_idx").on(table.userId),
    embeddingIdx: index("document_chunks_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("chat_threads_user_id_idx").on(table.userId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThreads.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    threadIdIdx: index("chat_messages_thread_id_idx").on(table.threadId),
    userIdIdx: index("chat_messages_user_id_idx").on(table.userId),
  })
);

export const citations = pgTable(
  "citations",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    chunkId: text("chunk_id")
      .notNull()
      .references(() => documentChunks.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 255 }).notNull(),
    pageNumber: integer("page_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    messageIdIdx: index("citations_message_id_idx").on(table.messageId),
  })
);

export const usersRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  documents: many(documents),
  documentChunks: many(documentChunks),
  chatThreads: many(chatThreads),
  chatMessages: many(chatMessages),
}));

export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(user, {
    fields: [documents.userId],
    references: [user.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(
  documentChunks,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentChunks.documentId],
      references: [documents.id],
    }),
    user: one(user, {
      fields: [documentChunks.userId],
      references: [user.id],
    }),
  })
);

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  user: one(user, {
    fields: [chatThreads.userId],
    references: [user.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(
  chatMessages,
  ({ one, many }) => ({
    thread: one(chatThreads, {
      fields: [chatMessages.threadId],
      references: [chatThreads.id],
    }),
    user: one(user, {
      fields: [chatMessages.userId],
      references: [user.id],
    }),
    citations: many(citations),
  })
);

export const citationsRelations = relations(citations, ({ one }) => ({
  message: one(chatMessages, {
    fields: [citations.messageId],
    references: [chatMessages.id],
  }),
  chunk: one(documentChunks, {
    fields: [citations.chunkId],
    references: [documentChunks.id],
  }),
}));
