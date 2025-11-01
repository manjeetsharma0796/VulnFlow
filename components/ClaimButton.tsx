"use client";

import { Button } from "@/components/ui/button";
import { useWriteContract, useAccount } from "wagmi";
import { useContracts } from "@/lib/contract";
import { useState } from "react";
import { toast } from "sonner";
import { Gift } from "lucide-react";

export function ClaimButton({ compact = false }: { compact?: boolean }) {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Claiming daily VFT tokens...", { id: "claim" });
      await writeContractAsync({
        address: addresses.DailyClaim,
        abi: abis.DailyClaim,
        functionName: "claim",
        args: [],
      });
      toast.success("Daily VFT tokens claimed successfully! 🎉", { id: "claim" });
    } catch (e: any) {
      const errorMsg = e?.shortMessage || e?.message || "Claim failed";
      toast.error(`Claim failed: ${errorMsg}`, { id: "claim" });
      console.error("Claim error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={compact
        ? "bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-3 h-auto"
        : "bg-purple-600 hover:bg-purple-700 text-white"
      }
    >
      <Gift className="h-3 w-3 mr-1.5" />
      {loading ? "Claiming..." : "Claim Daily VFT"}
    </Button>
  );
}
