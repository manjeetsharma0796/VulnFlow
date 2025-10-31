import { Shield, Code2, Coins, Workflow } from "lucide-react";

export function InfoGrid() {
  const items = [
    {
      icon: Shield,
      title: "Security First",
      desc: "AI-assisted audits highlight vulnerabilities by severity so you can ship safely.",
    },
    {
      icon: Code2,
      title: "Smart Fixes",
      desc: "Auto-fix suggestions with diffs to accelerate your remediation workflow.",
    },
    {
      icon: Coins,
      title: "VFT Payments",
      desc: "Pay for fixes on-chain using VulnFlow Token with seamless approvals.",
    },
    {
      icon: Workflow,
      title: "Dev Workflow",
      desc: "Paste Solidity → Analyze → Optional Auto-Fix → Review and deploy.",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border p-6 bg-card text-card-foreground shadow-sm hover:shadow transition">
          <div className="flex items-start gap-4">
            <it.icon className="w-6 h-6 text-primary" />
            <div>
              <div className="text-lg font-medium">{it.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{it.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
