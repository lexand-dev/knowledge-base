import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E6E1] bg-[#FAF9F7] dark:border-[#262626] dark:bg-[#0F0F0F]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                KnowledgeBase
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              AI-powered document search for modern teams. Find answers instantly across all your knowledge.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">Product</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/#features" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Try it free
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">Company</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">Legal</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E8E6E1] pt-8 dark:border-[#262626] md:flex-row">
          <p className="text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
            &copy; {new Date().getFullYear()} KnowledgeBase. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#F5F3EF] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-[#FAFAFA]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#F5F3EF] hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-[#FAFAFA]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}