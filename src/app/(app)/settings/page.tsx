"use client";

import { useState } from "react";
import { useGetSession } from "@/features/auth/api/use-get-session";

export default function SettingsPage() {
  const { data: session, isLoading: loading } = useGetSession();
  const user = session?.user ?? null;
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage("Settings saved successfully.");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D7377] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9F7] dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-instrument)] text-2xl font-bold text-[#1a1a1a] dark:text-[#FAFAFA]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
            Manage your account settings
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 dark:border-[#262626] dark:bg-[#1A1A1A]">
            <h2 className="font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
              Profile
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              Update your personal information
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 block w-full rounded-xl border border-[#E8E6E1] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#A3A3A3] transition-colors focus:border-[#0D7377] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 dark:border-[#262626] dark:bg-[#0F0F0F] dark:text-[#FAFAFA] dark:placeholder-[#6B6B6B] dark:focus:border-[#14919B]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-2 block w-full rounded-xl border border-[#E8E6E1] bg-[#F5F3EF] px-4 py-3 text-sm text-[#6B6B6B] dark:border-[#262626] dark:bg-[#262626] dark:text-[#A3A3A3] cursor-not-allowed"
                />
              </div>
            </div>

            {message && (
              <p className={`mt-4 text-sm ${message.includes("success") ? "text-[#0D7377]" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 rounded-xl bg-[#0D7377] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#0A5C5F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>

          <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 dark:border-[#262626] dark:bg-[#1A1A1A]">
            <h2 className="font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              Permanently delete your account and all associated data
            </p>
            <button
              className="mt-4 rounded-xl border border-red-200 px-6 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/10"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
