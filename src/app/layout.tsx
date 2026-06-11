import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KnowledgeBase - AI-Powered Document Search",
  description: "Find answers instantly across all your documents. AI-powered search with citations for modern teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${instrumentSans.variable} min-h-full bg-[#FAF9F7] text-[#1a1a1a] antialiased dark:bg-[#0F0F0F] dark:text-[#FAFAFA]`}
      >
        {children}
      </body>
    </html>
  );
}