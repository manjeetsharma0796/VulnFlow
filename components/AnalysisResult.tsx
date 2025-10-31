import { Badge } from "@/components/ui/badge";

const order = ["Critical", "High", "Medium", "Low"] as const;

function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
      <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AnalysisResult({ report }: { report: any | null }) {
  if (!report) return <div className="text-sm text-muted-foreground">No analysis yet.</div>;

  const grouped: Record<string, any[]> = {};
  for (const sev of order) grouped[sev] = [];
  for (const item of report.issues ?? []) {
    const sev = item.severity || "Low";
    (grouped[sev] ||= []).push(item);
  }

  const m = report.metrics || {};

  return (
    <div className="space-y-6">
      {report.metrics && (
        <div className="rounded-md border p-4">
          <div className="text-sm font-medium mb-3">Metrics</div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            {m.overallScore !== undefined && (
              <div className="flex items-center gap-4">
                <Speedometer value={m.overallScore} />
                <div className="flex-1">
                  <div className="flex items-center justify-between"><span>Overall Score</span><span>{m.overallScore}/100</span></div>
                  <Progress value={m.overallScore} />
                </div>
              </div>
            )}
            {m.securityScore !== undefined && (
              <div>
                <div className="flex items-center justify-between"><span>Security</span><span>{m.securityScore}/100</span></div>
                <Progress value={m.securityScore} />
              </div>
            )}
            {m.gasScore !== undefined && (
              <div>
                <div className="flex items-center justify-between"><span>Gas Efficiency</span><span>{m.gasScore}/100</span></div>
                <Progress value={m.gasScore} />
              </div>
            )}
            {m.maintainabilityScore !== undefined && (
              <div>
                <div className="flex items-center justify-between"><span>Maintainability</span><span>{m.maintainabilityScore}/100</span></div>
                <Progress value={m.maintainabilityScore} />
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              {m.cyclomaticComplexity !== undefined && (
                <div>Cyclomatic: {m.cyclomaticComplexity}</div>
              )}
              {m.codeSmells !== undefined && (
                <div>Code Smells: {m.codeSmells}</div>
              )}
              {m.securityFlags !== undefined && (
                <div>Security Flags: {m.securityFlags}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {order.map((sev) => (
        <div key={sev} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={sev === "Critical" ? "destructive" : "default"}>{sev}</Badge>
            <span className="text-sm text-muted-foreground">{grouped[sev]?.length || 0} issues</span>
          </div>
          <ul className="space-y-2">
            {grouped[sev]?.map((i, idx) => (
              <li key={idx} className="text-sm">
                <div className="font-medium">{i.title || i.type || "Issue"}</div>
                <div className="text-muted-foreground">{i.description || i.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Speedometer({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const start = -140; // degrees
  const end = 140; // degrees
  const angle = start + ((end - start) * pct) / 100;
  const r = 26;
  const cx = 30;
  const cy = 30;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x = cx + r * Math.cos(toRad(angle));
  const y = cy + r * Math.sin(toRad(angle));

  return (
    <svg width="72" height="48" viewBox="0 0 60 40" aria-label="speedometer">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M6 32 A24 24 0 0 1 54 32" fill="none" stroke="url(#g)" strokeWidth="6" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.5" fill="#111827" />
    </svg>
  );
}
