import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[#E8E6E1] bg-[#FAF9F7]/95 backdrop-blur-sm dark:border-[#262626] dark:bg-[#0F0F0F]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377] text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
              KnowledgeBase
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
            >
              Pricing
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#1a1a1a] dark:text-[#A3A3A3] dark:hover:text-[#FAFAFA]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#0D7377] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0A5C5F] hover:shadow-lg hover:shadow-[#0D7377]/20"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#0D7377]/5 blur-3xl" />
            <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-[#14919B]/5 blur-3xl" />
          </div>
          
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E6E1] bg-white px-4 py-1.5 text-sm text-[#6B6B6B] shadow-sm dark:border-[#262626] dark:bg-[#1A1A1A] dark:text-[#A3A3A3]">
              <span className="h-2 w-2 rounded-full bg-[#0D7377]" />
              AI-powered search is here
            </div>
            
            <h1 className="mt-8 font-[family-name:var(--font-instrument)] text-5xl font700 tracking-tight text-[#1a1a1a] dark:text-[#FAFAFA] md:text-7xl">
              Find answers{" "}
              <span className="text-[#0D7377]">instantly</span>
              <br />
              across all your documents
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6B6B6B] dark:text-[#A3A3A3]">
              Stop searching through endless files. KnowledgeBase uses AI to understand your documents and answer your questions with precise citations.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-[#0D7377] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#0A5C5F] hover:shadow-xl hover:shadow-[#0D7377]/20"
              >
                Start for free
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-2 rounded-xl border border-[#E8E6E1] bg-white px-8 py-4 text-base font-medium text-[#1a1a1a] transition-all hover:bg-[#F5F3EF] dark:border-[#262626] dark:bg-[#1A1A1A] dark:text-[#FAFAFA] dark:hover:bg-[#262626]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch demo
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-instrument)] text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#FAFAFA] md:text-4xl">
                Everything you need to manage knowledge
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B6B6B] dark:text-[#A3A3A3]">
                From document upload to instant answers, we handle the complexity so you can focus on what matters.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="group relative rounded-2xl border border-[#E8E6E1] bg-white p-8 transition-all hover:border-[#0D7377]/30 hover:shadow-xl hover:shadow-[#0D7377]/5 dark:border-[#262626] dark:bg-[#1A1A1A]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7377]/10 text-[#0D7377]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                  Smart Upload
                </h3>
                <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                  Drag and drop PDF, DOCX, and TXT files. We automatically extract, chunk, and embed your content for instant search.
                </p>
              </div>

              <div className="group relative rounded-2xl border border-[#E8E6E1] bg-white p-8 transition-all hover:border-[#0D7377]/30 hover:shadow-xl hover:shadow-[#0D7377]/5 dark:border-[#262626] dark:bg-[#1A1A1A]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7377]/10 text-[#0D7377]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                  AI Chat
                </h3>
                <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                  Ask questions in natural language and get instant answers with precise citations to the source documents.
                </p>
              </div>

              <div className="group relative rounded-2xl border border-[#E8E6E1] bg-white p-8 transition-all hover:border-[#0D7377]/30 hover:shadow-xl hover:shadow-[#0D7377]/5 dark:border-[#262626] dark:bg-[#1A1A1A]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7377]/10 text-[#0D7377]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-instrument)] text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                  Trusted Answers
                </h3>
                <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                  Every answer comes with citations so you can verify the source and dive deeper into the original content.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#E8E6E1] bg-[#FAF9F7] dark:border-[#262626] dark:bg-[#1A1A1A]">
              <div className="absolute inset-0 -z-10">
                <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[#0D7377]/10 blur-3xl" />
              </div>
              
              <div className="p-12 md:p-16">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="font-[family-name:var(--font-instrument)] text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#FAFAFA] md:text-4xl">
                    Ready to transform how your team searches?
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B6B6B] dark:text-[#A3A3A3]">
                    Join hundreds of teams who have replaced endless searching with instant, AI-powered answers.
                  </p>
                  <div className="mt-10">
                    <Link
                      href="/signup"
                      className="rounded-xl bg-[#0D7377] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#0A5C5F] hover:shadow-xl hover:shadow-[#0D7377]/20"
                    >
                      Get started for free
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}