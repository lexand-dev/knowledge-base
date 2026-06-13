"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGetSession } from "@/features/auth/api/use-get-session";
import { useSignOut } from "@/features/auth/api/use-sign-out";

export function Header() {
  const { data: session, isLoading: loading } = useGetSession();
  const signOut = useSignOut();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return saved || (systemDark ? "dark" : "light");
    }
    return "light";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const user = session?.user ?? null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E6E1] bg-[#FAF9F7]/95 backdrop-blur-sm dark:border-[#262626] dark:bg-[#0F0F0F]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377] text-white transition-transform duration-200 group-hover:scale-105">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
              KnowledgeBase
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/documents"
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive("/documents")
                  ? "text-[#0D7377] dark:text-[#14919B]"
                  : "text-[#6B6B6B] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
              }`}
            >
              Documents
              {isActive("/documents") && (
                <span className="absolute inset-x-1 -bottom-[21px] h-0.5 rounded-full bg-[#0D7377] dark:bg-[#14919B]" />
              )}
            </Link>
            <Link
              href="/chat"
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive("/chat")
                  ? "text-[#0D7377] dark:text-[#14919B]"
                  : "text-[#6B6B6B] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
              }`}
            >
              Chat
              {isActive("/chat") && (
                <span className="absolute inset-x-1 -bottom-[21px] h-0.5 rounded-full bg-[#0D7377] dark:bg-[#14919B]" />
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#F5F3EF] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-[#FAFAFA]"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-[#F5F3EF] dark:bg-[#1A1A1A]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D7377] text-white text-sm font-medium transition-transform hover:scale-105"
              >
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#E8E6E1] bg-white py-1 shadow-lg shadow-black/5 dark:border-[#262626] dark:bg-[#1A1A1A] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="border-b border-[#E8E6E1] px-4 py-3 dark:border-[#262626]">
                    <p className="text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-[#6B6B6B] dark:text-[#A3A3A3]">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B6B] transition-colors hover:bg-[#F5F3EF] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#C73E3E] transition-colors hover:bg-red-50 dark:text-[#F87171] dark:hover:bg-red-900/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-[#0D7377] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0A5C5F] hover:shadow-lg hover:shadow-[#0D7377]/20"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}