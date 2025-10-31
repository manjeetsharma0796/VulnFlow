"use client";

import { useAccount, useBalance } from "wagmi";
import { useContracts } from "@/lib/contract";
import { formatUnits } from "viem";

export function TokenBalance({ compact = false }: { compact?: boolean }) {
  const { address } = useAccount();
  const { addresses } = useContracts();
  const { data } = useBalance({
    address,
    token: addresses.VulnFlowToken,
    query: { enabled: Boolean(address) },
  });

  if (!address) return <div className="text-sm text-muted-foreground">Connect To See Balance</div>;
  if (!data) return <div className="text-sm text-muted-foreground">-</div>;

  // Show a friendly <0.01 indicator instead of "0.00" for very small balances
  const numeric = parseFloat(formatUnits(data.value, data.decimals));
  const formatted = numeric === 0 ? "0.00" : numeric < 0.01 ? "<0.01" : numeric.toFixed(2);
  const text = compact ? `${formatted} ${data.symbol}` : `${formatUnits(data.value, data.decimals)} ${data.symbol}`;
  return <div className="text-sm text-muted-foreground">{text}</div>;
}
