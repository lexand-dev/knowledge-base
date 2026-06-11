import { hc } from "hono/client";
import type { AppType } from "./index";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const apiClient = hc<AppType>(getBaseUrl(), {
  init: {
    credentials: "include",
  },
});

export type ApiClient = typeof apiClient;

export { hc };
export type { AppType };