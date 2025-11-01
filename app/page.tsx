import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { InfoGrid } from "@/components/landing/InfoGrid";
import { LandingFooter } from "@/components/landing/Footer";
 
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-16">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold gradient-text">VulnFlow</h1>
        <p className="text-muted-foreground max-w-2xl">
          AI-assisted smart contract security auditing. Paste Solidity, get vulnerability analysis, and optional auto-fixes paid with VFT on Flow EVM Testnet.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/app" className={buttonVariants({ size: "lg" })}>Launch App</Link>
        <a href="https://github.com/manjeetsharma0796/vulnflow" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "lg" })}>GitHub</a>
      </div>

      <section className="w-full mt-10 px-4">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-2">Why VulnFlow?</h2>
          <p className="text-sm text-muted-foreground mb-6">A faster path from audit to fix with tokenized workflows.</p>
          <InfoGrid />
        </div>
      </section>

      <div className="w-full mt-16">
        <LandingFooter />
      </div>
    </div>
  );
}
