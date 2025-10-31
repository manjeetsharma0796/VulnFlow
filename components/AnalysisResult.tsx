"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Shield, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Activity,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const order = ["Critical", "High", "Medium", "Low"] as const;

function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
      <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  count, 
  children, 
  defaultOpen = true,
  severity 
}: { 
  title: string; 
  count: number; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  severity: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (count === 0) return null;

  const severityColors: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    Critical: {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-900",
      text: "text-red-700 dark:text-red-400",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />
    },
    High: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-900",
      text: "text-orange-700 dark:text-orange-400",
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />
    },
    Medium: {
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200 dark:border-yellow-900",
      text: "text-yellow-700 dark:text-yellow-400",
      icon: <Info className="w-5 h-5 text-yellow-600" />
    },
    Low: {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-900",
      text: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
    }
  };

  const colors = severityColors[severity] || severityColors.Low;

  return (
    <div className={cn("rounded-lg border p-4", colors.bg, colors.border)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {colors.icon}
          <span className={cn("font-semibold text-sm", colors.text)}>
            {title}
          </span>
          <Badge 
            variant={severity === "Critical" ? "destructive" : severity === "High" ? "outline" : "default"}
            className={cn(
              severity === "Critical" && "bg-red-600",
              severity === "High" && "bg-orange-600",
              severity === "Medium" && "bg-yellow-600",
              severity === "Low" && "bg-green-600"
            )}
          >
            {count}
          </Badge>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

function VulnerabilityCard({ 
  issue, 
  severity 
}: { 
  issue: any; 
  severity: string;
}) {
  const getIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("reentrancy")) return <Activity className="w-4 h-4" />;
    if (titleLower.includes("access") || titleLower.includes("permission")) return <Shield className="w-4 h-4" />;
    if (titleLower.includes("overflow") || titleLower.includes("underflow")) return <AlertCircle className="w-4 h-4" />;
    return <FileCode className="w-4 h-4" />;
  };

  const severityColors: Record<string, { border: string; bg: string }> = {
    Critical: {
      border: "border-l-red-500",
      bg: "bg-red-50/50 dark:bg-red-950/10"
    },
    High: {
      border: "border-l-orange-500",
      bg: "bg-orange-50/50 dark:bg-orange-950/10"
    },
    Medium: {
      border: "border-l-yellow-500",
      bg: "bg-yellow-50/50 dark:bg-yellow-950/10"
    },
    Low: {
      border: "border-l-green-500",
      bg: "bg-green-50/50 dark:bg-green-950/10"
    }
  };

  const colors = severityColors[severity] || severityColors.Low;

  return (
    <Card className={cn("border-l-4", colors.border, colors.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{getIcon(issue.title || issue.type || "")}</div>
          <CardTitle className="text-base font-semibold">
            {issue.title || issue.type || "Issue"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {issue.description || issue.detail || "No description available."}
        </p>
        {issue.line && (
          <div className="mt-2 text-xs text-muted-foreground">
            Line: {issue.line}
          </div>
        )}
      </CardContent>
    </Card>
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
  const totalIssues = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  const criticalCount = grouped.Critical?.length || 0;
  const highCount = grouped.High?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary + Metrics side-by-side on md+ screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalIssues}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
          {criticalCount === 0 && highCount === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>No critical or high severity issues found!</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Action required: {criticalCount} critical issue{criticalCount > 1 ? "s" : ""} found</span>
            </div>
          )}
        </CardContent>
        </Card>

        {/* Metrics Section */}
        {report.metrics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {m.overallScore !== undefined && (
              <div className="flex items-center gap-4">
                <Speedometer value={m.overallScore} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Score</span>
                    <span className="font-semibold">{m.overallScore}/100</span>
                  </div>
                  <Progress value={m.overallScore} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {m.securityScore !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Security</span>
                    <span className="font-semibold">{m.securityScore}/100</span>
                  </div>
                  <Progress value={m.securityScore} />
                </div>
              )}
              {m.gasScore !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Gas Efficiency</span>
                    <span className="font-semibold">{m.gasScore}/100</span>
                  </div>
                  <Progress value={m.gasScore} />
                </div>
              )}
              {m.maintainabilityScore !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Maintainability</span>
                    <span className="font-semibold">{m.maintainabilityScore}/100</span>
                  </div>
                  <Progress value={m.maintainabilityScore} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground pt-2 border-t">
              {m.cyclomaticComplexity !== undefined && (
                <div>
                  <div className="font-medium">Cyclomatic</div>
                  <div>{m.cyclomaticComplexity}</div>
                </div>
              )}
              {m.codeSmells !== undefined && (
                <div>
                  <div className="font-medium">Code Smells</div>
                  <div>{m.codeSmells}</div>
                </div>
              )}
              {m.securityFlags !== undefined && (
                <div>
                  <div className="font-medium">Security Flags</div>
                  <div>{m.securityFlags}</div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vulnerabilities by Severity */}
      <div className="space-y-4">
        {order.map((sev) => {
          const issues = grouped[sev] || [];
          if (issues.length === 0) return null;
          
          return (
            <CollapsibleSection
              key={sev}
              title={`${sev} Issues`}
              count={issues.length}
              severity={sev}
              defaultOpen={sev === "Critical" || sev === "High"}
            >
              {issues.map((issue, idx) => (
                <VulnerabilityCard key={idx} issue={issue} severity={sev} />
              ))}
            </CollapsibleSection>
          );
        })}
      </div>
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
