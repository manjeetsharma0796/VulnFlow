"use client";

import { Button } from "@/components/ui/moving-border";
import { Shield, Code } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TokenBalance } from "@/components/TokenBalance";
import { useWriteContract, useAccount } from "wagmi";
import { useContracts } from "@/lib/contract";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Navbar() {
  const { addresses, abis } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [claimLoading, setClaimLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Check claim eligibility on mount and address change
  useEffect(() => {
    if (!address) {
      setCanClaim(true);
      setTimeRemaining("");
      return;
    }

    const checkClaimEligibility = () => {
      const lastClaimKey = `vft_last_claim_${address}`;
      const lastClaimTime = localStorage.getItem(lastClaimKey);

      if (!lastClaimTime) {
        setCanClaim(true);
        setTimeRemaining("");
        return;
      }

      const lastClaim = parseInt(lastClaimTime);
      const now = Date.now();
      const timeDiff = now - lastClaim;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff >= twentyFourHours) {
        setCanClaim(true);
        setTimeRemaining("");
      } else {
        setCanClaim(false);
        const remaining = twentyFourHours - timeDiff;
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    checkClaimEligibility();
    const interval = setInterval(checkClaimEligibility, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [address]);

  const handleClaim = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!canClaim) {
      toast.info(`Come back in ${timeRemaining} ⏰`);
      return;
    }

    try {
      setClaimLoading(true);
      toast.loading("Minting VFT tokens...", { id: "claim" });

      // Mint 10 VFT tokens (10 * 10^18)
      const amount = BigInt(10) * BigInt(10 ** 18);

      await writeContractAsync({
        address: addresses.VulnFlowToken,
        abi: abis.VulnFlowToken,
        functionName: "mint",
        args: [address, amount],
      });

      // Store claim time in localStorage
      const lastClaimKey = `vft_last_claim_${address}`;
      localStorage.setItem(lastClaimKey, Date.now().toString());

      toast.success("10 VFT tokens claimed successfully! 🎉", { id: "claim" });
      setCanClaim(false);
    } catch (e: any) {
      const errorMsg = e?.shortMessage || e?.message || "Claim failed";

      // Check if it's an ownership error
      if (errorMsg.includes("Ownable") || errorMsg.includes("owner")) {
        toast.error("Only the contract owner can mint tokens", { id: "claim" });
      } else {
        toast.error(`Claim failed: ${errorMsg}`, { id: "claim" });
      }
      console.error("Claim error:", e);
    } finally {
      setClaimLoading(false);
    }
  };

  const navItems = [
    {
      name: "App",
      link: "/app",
      icon: <Code className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    <>
      <div className="h-[100px]"></div>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[5001] flex items-center gap-8">
        {/* Navigation */}
        <div className="flex items-center space-x-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-purple-300/40 rounded-full px-8 py-3 shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="font-bold text-purple-700 text-lg">VulnFlow</span>
          </Link>
          {/* Navigation Items */}
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.link as any}
              className="text-purple-700 hover:text-purple-600 transition-colors text-sm font-medium font-sans relative group"
            >
              {item.name}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {/* Claim Daily Button */}
          <button
            onClick={handleClaim}
            disabled={claimLoading || !canClaim}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${!canClaim && !claimLoading
              ? "bg-orange-500/20 text-orange-600 cursor-not-allowed"
              : claimLoading
                ? "bg-purple-500/30 text-purple-600 cursor-wait"
                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
              }`}
          >
            {!canClaim && !claimLoading
              ? `Claim in ${timeRemaining}`
              : claimLoading
                ? "Claiming..."
                : "Claim Daily 🎁"}
          </button>

          {/* Token Balance */}
          <div className="text-purple-700 text-sm font-medium font-sans">
            <TokenBalance compact />
          </div>

          {/* Wallet Connect Button */}
          <Button
            borderRadius="1.75rem"
            className="bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-lg text-white border-purple-300/50 hover:border-purple-200/70 transition-all font-sans shadow-lg"
            as="div"
          >
            <WalletConnectButton />
          </Button>
        </div>
      </div>
    </>
  );
}
