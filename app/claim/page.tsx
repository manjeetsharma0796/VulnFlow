"use client";

import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import { useContracts } from "@/lib/contract";
import { useState } from "react";

export default function ClaimPage() {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<string>("");

  const handleClaim = async () => {
    try {
      setStatus("Claiming...");
      await writeContractAsync({
        address: addresses.DailyClaim,
        abi: abis.DailyClaim,
        functionName: "claim",
        args: [],
      });
      setStatus("Claimed successfully.");
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || "Claim failed");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Daily VFT Claim</h1>
      <p className="text-sm text-muted-foreground">Claim once every 24 hours.</p>
      <Button onClick={handleClaim}>Claim</Button>
      {status && <div className="text-sm">{status}</div>}
    </div>
  );
}
