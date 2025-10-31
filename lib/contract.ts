import tokenAbi from "../abis/VulnFlowToken.json" assert { type: "json" };
import dailyAbi from "../abis/DailyClaim.json" assert { type: "json" };
import payAbi from "../abis/PaymentProcessor.json" assert { type: "json" };
import addressesJson from "@/config/contracts.json" assert { type: "json" };

export function useContracts() {
  const addresses = addressesJson as unknown as {
    VulnFlowToken: `0x${string}`;
    DailyClaim: `0x${string}`;
    PaymentProcessor: `0x${string}`;
  };

  const abis = {
    VulnFlowToken: tokenAbi as any,
    DailyClaim: dailyAbi as any,
    PaymentProcessor: payAbi as any,
  } as const;

  return { addresses, abis };
}
