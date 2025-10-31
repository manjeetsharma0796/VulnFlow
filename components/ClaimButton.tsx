"use client";

import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import { useContracts } from "@/lib/contract";
import { useState } from "react";

export function ClaimButton() {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      await writeContractAsync({
        address: addresses.DailyClaim,
        abi: abis.DailyClaim,
        functionName: "claim",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? "Claiming..." : "Claim VFT"}
    </Button>
  );
}
