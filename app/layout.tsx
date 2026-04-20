import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mortgage Feasibility Analyzer",
  description: "Evaluate your mortgage eligibility with instant feasibility analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-primary-900 text-white shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              MortgageCheck
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-primary-200 transition-colors">
                Home
              </Link>
              <Link href="/analyze" className="hover:text-primary-200 transition-colors">
                Analyze
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-slate-800 text-slate-400 text-center text-sm py-6 mt-16">
          MortgageCheck &mdash; Mortgage Feasibility Analyzer Demo
        </footer>
      </body>
    </html>
  );
}
