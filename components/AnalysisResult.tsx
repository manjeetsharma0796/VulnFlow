import { Badge } from "@/components/ui/badge";

const order = ["Critical", "High", "Medium", "Low"] as const;

export function AnalysisResult({ report }: { report: any | null }) {
  if (!report) return <div className="text-sm text-muted-foreground">No analysis yet.</div>;

  const grouped: Record<string, any[]> = {};
  for (const sev of order) grouped[sev] = [];
  for (const item of report.issues ?? []) {
    const sev = item.severity || "Low";
    (grouped[sev] ||= []).push(item);
  }

  return (
    <div className="space-y-6">
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
