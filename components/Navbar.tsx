"use client";

import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TokenBalance } from "@/components/TokenBalance";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header className="border-b bg-white/70 backdrop-blur-md dark:bg-black/40">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">VulnFlow</Link>
        <nav className="flex items-center gap-3">
          <Link href="/app" className={buttonVariants({ variant: "ghost" })}>App</Link>
          <Link href="/claim" className={buttonVariants({ variant: "ghost" })}>Claim</Link>
          <Link href="/wallet" className={buttonVariants({ variant: "ghost" })}>Wallet</Link>
          <TokenBalance compact />
          <ThemeToggle />
          <WalletConnectButton />
        </nav>
      </div>
    </header>
  );
}
