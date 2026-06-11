import Link from "next/link";

function StatCard({
  label,
  value,
  description,
  delay,
}: {
  label: string;
  value: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-[#1A1A1A] opacity-0 animate-slide-up ${delay}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <p className="text-sm font-medium text-[#6B6B6B] dark:text-[#A3A3A3]">
          {label}
        </p>
        <p className="mt-2 font-serif text-4xl font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
          {value}
        </p>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
          {description}
        </p>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0D7377]/5 blur-2xl" />
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-start gap-4 rounded-2xl border border-[#E8E6E1] bg-white p-6 transition-all duration-300 hover:border-[#0D7377]/30 hover:shadow-lg hover:shadow-[#0D7377]/5 dark:border-[#333333] dark:bg-[#1A1A1A] dark:hover:border-[#14919B]/30 opacity-0 animate-scale-in ${delay}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7377]/10 text-[#0D7377] transition-colors group-hover:bg-[#0D7377] group-hover:text-white">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
          {description}
        </p>
      </div>
      <svg
        className="ml-auto h-5 w-5 text-[#6B6B6B] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#0D7377] dark:text-[#A3A3A3] dark:group-hover:text-[#14919B]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </Link>
  );
}

function RecentActivityItem({
  icon,
  title,
  time,
  type,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
  type: "document" | "chat";
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          type === "document"
            ? "bg-[#0D7377]/10 text-[#0D7377]"
            : "bg-[#D4A853]/10 text-[#D4A853]"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
          {title}
        </p>
        <p className="text-xs text-[#6B6B6B] dark:text-[#A3A3A3]">{time}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#E8E6E1] bg-white/80 backdrop-blur-sm dark:border-[#333333] dark:bg-[#0F0F0F]/80">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D7377] text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                  Knowledge Base
                </h1>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A3A3A3]">
                  AI-powered document search
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/documents"
                className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]"
              >
                Documents
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#0D7377] dark:text-[#A3A3A3] dark:hover:text-[#14919B]"
              >
                Chat
              </Link>
              <div className="h-6 w-px bg-[#E8E6E1] dark:bg-[#333333]" />
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F3EF] text-[#6B6B6B] transition-colors hover:bg-[#0D7377] hover:text-white dark:bg-[#262626] dark:text-[#A3A3A3] dark:hover:bg-[#14919B]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-16">
          <div className="mb-2 opacity-0 animate-fade-in">
            <p className="text-sm font-medium uppercase tracking-wider text-[#0D7377] dark:text-[#14919B]">
              Dashboard
            </p>
          </div>
          <h2
            className="font-serif text-4xl font-semibold text-[#1a1a1a] dark:text-[#FAFAFA] opacity-0 animate-slide-up stagger-1"
            style={{ lineHeight: 1.2 }}
          >
            Welcome back
          </h2>
          <p className="mt-3 max-w-xl text-[#6B6B6B] dark:text-[#A3A3A3] opacity-0 animate-slide-up stagger-2">
            Your AI-powered knowledge base is ready. Search through documents,
            chat with AI, and discover insights.
          </p>
        </section>

        <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Documents"
            value="0"
            description="Upload your first document"
            delay="stagger-1"
          />
          <StatCard
            label="Knowledge Chunks"
            value="0"
            description="Processed and indexed"
            delay="stagger-2"
          />
          <StatCard
            label="Chat Sessions"
            value="0"
            description="Conversations this month"
            delay="stagger-3"
          />
          <StatCard
            label="Citations Used"
            value="0"
            description="References from documents"
            delay="stagger-4"
          />
        </section>

        <section className="mb-16">
          <h3 className="mb-6 font-serif text-2xl font-semibold text-[#1a1a1a] dark:text-[#FAFAFA] opacity-0 animate-fade-in stagger-3">
            Quick Actions
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              href="/documents"
              delay="stagger-1"
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              }
              title="Upload Documents"
              description="Add PDF, DOCX, or TXT files"
            />
            <QuickAction
              href="/chat"
              delay="stagger-2"
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              title="Start Chat"
              description="Ask questions about your docs"
            />
            <QuickAction
              href="/documents"
              delay="stagger-3"
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              title="Search Knowledge"
              description="Find answers across all documents"
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 dark:border-[#333333] dark:bg-[#1A1A1A] opacity-0 animate-fade-in stagger-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                Recent Activity
              </h3>
              <button className="text-sm font-medium text-[#0D7377] hover:text-[#14919B] dark:text-[#14919B]">
                View all
              </button>
            </div>
            <div className="divide-y divide-[#E8E6E1] dark:divide-[#333333]">
              <RecentActivityItem
                type="document"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                title="No documents yet"
                time="Upload your first document to get started"
              />
              <RecentActivityItem
                type="chat"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                }
                title="No conversations yet"
                time="Start chatting to see activity here"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 dark:border-[#333333] dark:bg-[#1A1A1A] opacity-0 animate-fade-in stagger-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a] dark:text-[#FAFAFA]">
                Getting Started
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-xl bg-[#F5F3EF] p-4 dark:bg-[#262626]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377] text-white text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                    Upload Documents
                  </p>
                  <p className="mt-0.5 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                    Add your PDF, DOCX, or TXT files to the knowledge base
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-[#F5F3EF] p-4 dark:bg-[#262626]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377] text-white text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                    Wait for Processing
                  </p>
                  <p className="mt-0.5 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                    Documents are chunked and indexed automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-[#F5F3EF] p-4 dark:bg-[#262626]">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377] text-white text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a] dark:text-[#FAFAFA]">
                    Start Chatting
                  </p>
                  <p className="mt-0.5 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
                    Ask questions and get answers with citations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8E6E1] bg-white dark:border-[#333333] dark:bg-[#0F0F0F]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D7377] text-white">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span>Knowledge Base</span>
            </div>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A3A3A3]">
              AI-powered document search for modern teams
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}