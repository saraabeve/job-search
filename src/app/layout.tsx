import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TailorCV — apply with a CV that fits the job",
  description: "Build or upload your CV, tailor it to each job posting, and track your applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line bg-white print:hidden">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Tailor<span className="text-brand">CV</span>
            </Link>
            <Link href="/cv" className="text-sm text-muted hover:text-ink">
              My CVs
            </Link>
            <Link href="/jobs" className="text-sm text-muted hover:text-ink">
              Jobs
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:p-0">{children}</main>
      </body>
    </html>
  );
}
