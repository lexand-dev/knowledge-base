"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/hn-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Signing up with:", { name, email, password });

    const { data } = await authClient.signUp.email({
      name,
      email,
      password,
    }, {
      onRequest: (ctx) => {
        setLoading(true);
      },
      onSuccess: (ctx) => {
        //redirect to the dashboard or sign in page
        setLoading(false);
        router.push("/dashboard");
      },
      onError: (ctx) => {
        // display the error message
        setLoading(false);
        setError(ctx.error.message);
        alert(ctx.error.name + ": " + ctx.error.message);
      },
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[#E8E6E1] bg-white p-8 shadow-sm dark:border-[#262626] dark:bg-[#1A1A1A]">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-instrument)] text-2xl font-bold text-[#1a1a1a] dark:text-[#FAFAFA]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
            Start your free trial today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
              Full name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="mt-2 block w-full rounded-xl border border-[#E8E6E1] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#A3A3A3] transition-colors focus:border-[#0D7377] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 dark:border-[#262626] dark:bg-[#0F0F0F] dark:text-[#FAFAFA] dark:placeholder-[#6B6B6B] dark:focus:border-[#14919B] dark:focus:ring-[#14919B]/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="mt-2 block w-full rounded-xl border border-[#E8E6E1] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#A3A3A3] transition-colors focus:border-[#0D7377] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 dark:border-[#262626] dark:bg-[#0F0F0F] dark:text-[#FAFAFA] dark:placeholder-[#6B6B6B] dark:focus:border-[#14919B] dark:focus:ring-[#14919B]/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-2 block w-full rounded-xl border border-[#E8E6E1] bg-[#FAF9F7] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#A3A3A3] transition-colors focus:border-[#0D7377] focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 dark:border-[#262626] dark:bg-[#0F0F0F] dark:text-[#FAFAFA] dark:placeholder-[#6B6B6B] dark:focus:border-[#14919B] dark:focus:ring-[#14919B]/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0D7377] py-3 text-sm font-medium text-white transition-all hover:bg-[#0A5C5F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-[#0D7377] hover:text-[#0A5C5F] dark:text-[#14919B] dark:hover:text-[#0D7377]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
