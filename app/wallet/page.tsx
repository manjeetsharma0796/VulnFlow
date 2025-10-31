"use client";

import { useAccount } from "wagmi";
import { TokenBalance } from "@/components/TokenBalance";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Wallet</h1>
      <div className="text-sm text-muted-foreground">{isConnected ? address : "Not connected"}</div>
      <TokenBalance />
    </div>
  );
}
