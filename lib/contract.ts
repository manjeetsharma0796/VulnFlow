import tokenAbi from "../abis/VulnFlowToken.json" assert { type: "json" };
import addressesJson from "@/config/contracts.json" assert { type: "json" };

export function useContracts() {
  const addresses = addressesJson as unknown as {
    VulnFlowToken: `0x${string}`;
    DailyClaim: `0x${string}`;
    PaymentProcessor: `0x${string}`;
  };

  const abis = {
    VulnFlowToken: tokenAbi as any,
  } as const;

  return { addresses, abis };
}
