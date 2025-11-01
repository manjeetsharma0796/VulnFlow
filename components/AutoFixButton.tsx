"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useContracts } from "@/lib/contract";
import { useWriteContract, useAccount } from "wagmi";
import { useState } from "react";
import { toast } from "sonner";

const COST = 5n * 10n ** 18n; // 5 VFT tokens
const RECEIVER_ADDRESS = "0xfB8ae9808D84BF601f2Ef6178Da51a612bD046D0";

export function AutoFixButton({
  disabled,
  source,
  language,
  onApplied,
}: {
  disabled?: boolean;
  source?: string;
  language?: "solidity" | "cadence";
  onApplied?: (improvedSource: string) => void;
}) {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  const handleAutoFix = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Transfer 5 VFT tokens as payment
      toast.loading("Processing payment (5 VFT)...", { id: "payment" });
      await writeContractAsync({
        address: addresses.VulnFlowToken,
        abi: abis.VulnFlowToken,
        functionName: "transfer",
        args: [RECEIVER_ADDRESS, COST],
      });
      toast.success("Payment successful!", { id: "payment" });

      // Step 2: Call AI to generate fix
      toast.loading("AI is analyzing and fixing your contract...", { id: "ai-fix" });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      try {
        const res = await fetch("/api/autofix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, language }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || `API error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const improved = json?.improvedSource as string;

        if (!improved || typeof improved !== "string") {
          throw new Error("AI did not return valid code. Please try again.");
        }

        toast.success("AI Auto-Fix generated successfully! Check the result below.", { id: "ai-fix" });

        if (onApplied) {
          onApplied(improved);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          toast.error("Request timed out. The AI service may be slow. Please try again.", { id: "ai-fix" });
          throw new Error("Request timed out. The AI service may be slow. Please try again.");
        }
        toast.error(fetchError?.message || "AI processing failed", { id: "ai-fix" });
        throw fetchError;
      }
    } catch (e: any) {
      const errorMsg = e?.shortMessage || e?.message || "Operation failed";
      console.error("Auto-Fix error:", e);

      // Check for insufficient balance
      if (errorMsg.includes("InsufficientBalance") || errorMsg.includes("insufficient")) {
        toast.error("Insufficient VFT balance. Please claim tokens first.");
      } else if (!e?.message?.includes("timed out") && !e?.message?.includes("AI processing")) {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleAutoFix}
      disabled={disabled || loading}
      className="w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform transition hover:scale-[1.02]"
    >
      <span className="inline-flex items-center gap-2">
        {loading ? (
          "Processing..."
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Auto-Fix AI 🪄 (5 VFT)</span>
          </>
        )}
      </span>
    </Button>
  );
}
