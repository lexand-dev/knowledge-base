import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { pool } from "./db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(pool, {
    provider: "pg",
    schema: {
      user: {
        modelName: "users",
        fields: {
          id: "id",
          email: "email",
          name: "name",
          emailVerified: "email_verified",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
        additionalFields: {
          tenantId: { type: "number" },
          role: { type: "string" },
        },
      },
      session: {
        modelName: "sessions",
        fields: {
          id: "id",
          userId: "user_id",
          expiresAt: "expires_at",
          token: "token",
          ipAddress: "ip_address",
          userAgent: "user_agent",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
      account: {
        modelName: "accounts",
        fields: {
          id: "id",
          userId: "user_id",
          accountId: "account_id",
          providerId: "provider_id",
          accessToken: "access_token",
          refreshToken: "refresh_token",
          idToken: "id_token",
          accessTokenExpiresAt: "access_token_expires_at",
          refreshTokenExpiresAt: "refresh_token_expires_at",
          scope: "scope",
          password: "password",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
      verification: {
        modelName: "verifications",
        fields: {
          id: "id",
          identifier: "identifier",
          value: "value",
          expiresAt: "expires_at",
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      },
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
      console.log(`Magic link for ${email}: ${url}`);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
});

export type Auth = typeof auth;