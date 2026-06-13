import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const client = hc<AppType>(getBaseUrl(), {
  init: {
    credentials: "include",
  },
});

export type ApiClient = typeof client;

export { hc };
export type { AppType };
