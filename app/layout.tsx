import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavLinks } from "./NavLinks";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus Telecom · CX Agent",
  description: "Call centre AI agent — consumer and enterprise customer intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-card">
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-8">
            <div className="font-semibold tracking-tight">
              Nexus Telecom{" "}
              <span className="text-slate-400 font-normal">· CX Agent</span>
            </div>
            <NavLinks />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
