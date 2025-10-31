"use client";

import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/contract";
import { useWriteContract } from "wagmi";
import { useState } from "react";
import { toast } from "sonner";

const COST = 5n * 10n ** 18n;

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
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      
      // Step 1: Approve token
      toast.loading("Approving VFT payment...", { id: "approve" });
      await writeContractAsync({
        address: addresses.VulnFlowToken,
        abi: abis.VulnFlowToken,
        functionName: "approve",
        args: [addresses.PaymentProcessor, COST],
      });
      toast.success("Token approval successful!", { id: "approve" });
      
      // Step 2: Process payment
      toast.loading("Processing payment...", { id: "payment" });
      await writeContractAsync({
        address: addresses.PaymentProcessor,
        abi: abis.PaymentProcessor,
        functionName: "payForFix",
        args: [COST],
      });
      toast.success("Payment processed successfully!", { id: "payment" });
      
      // Step 3: Call AI to generate fix
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
      if (!e?.message?.includes("timed out") && !e?.message?.includes("AI processing")) {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handlePay} disabled={disabled || loading}>
      {loading ? "Processing..." : "Auto-Fix using AI (Pay VFT)"}
    </Button>
  );
}
