import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VulnFlow",
  description: "AI-assisted smart contract security on Flow EVM Testnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-dvh magic-surface">
            <Navbar />
            <main className="container py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
