"use client";

import { useAccount, useBalance } from "wagmi";
import { useContracts } from "@/lib/contract";

export function TokenBalance({ compact = false }: { compact?: boolean }) {
  const { address } = useAccount();
  const { addresses } = useContracts();
  const { data } = useBalance({
    address,
    token: addresses.VulnFlowToken,
    query: { enabled: Boolean(address) },
  });

  if (!address) return <div className="text-sm text-muted-foreground">Connect</div>;
  const text = data ? `${data.formatted} ${data.symbol}` : "-";
  return <div className="text-sm text-muted-foreground">{compact ? data?.symbol || "VFT" : text}</div>;
}
