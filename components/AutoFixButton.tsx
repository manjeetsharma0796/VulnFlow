"use client";

import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/contract";
import { useWriteContract } from "wagmi";
import { useState } from "react";

const COST = 5n * 10n ** 18n;

export function AutoFixButton({ disabled }: { disabled?: boolean }) {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      await writeContractAsync({
        address: addresses.VulnFlowToken,
        abi: abis.VulnFlowToken,
        functionName: "approve",
        args: [addresses.PaymentProcessor, COST],
      });
      await writeContractAsync({
        address: addresses.PaymentProcessor,
        abi: abis.PaymentProcessor,
        functionName: "payForFix",
        args: [COST],
      });
      alert("Payment succeeded. Fetching improved code from AI...");
      // In real flow, call your AI endpoint to get improved code and show diff/download
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handlePay} disabled={disabled || loading}>
      {loading ? "Processing..." : "Auto-Fix (Pay VFT)"}
    </Button>
  );
}
