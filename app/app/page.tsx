"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResult } from "@/components/AnalysisResult";
import { AutoFixButton } from "@/components/AutoFixButton";
import { ClaimButton } from "@/components/ClaimButton";
import { TokenBalance } from "@/components/TokenBalance";
import { toast } from "sonner";
import { Coins } from "lucide-react";

const MonacoEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

export default function DashboardPage() {
  const [source, setSource] = useState<string>("// Paste smart contract here\n");
  const [fixedSource, setFixedSource] = useState<string | null>(null);
  const [language, setLanguage] = useState<"solidity" | "cadence">("solidity");
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const fixedSourceRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    toast.loading("Analyzing contract for vulnerabilities...", { id: "analyze" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, language }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.error || "Analysis failed", { id: "analyze" });
        return;
      }

      const json = await res.json();
      setReport(json);
      toast.success("Analysis completed successfully!", { id: "analyze" });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to analyze contract", { id: "analyze" });
    } finally {
      setLoading(false);
    }
  };

  const monacoLang = "sol"; // Force Solidity mode for both selections

  // Smooth scroll to analysis section when analysis completes
  useEffect(() => {
    if (report && analysisRef.current) {
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [report]);

  // Smooth scroll to fixed code section when auto-fix completes
  useEffect(() => {
    if (fixedSource && fixedSourceRef.current) {
      setTimeout(() => {
        fixedSourceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [fixedSource]);

  return (
    <div className="space-y-6">
      {/* Claim VFT Section */}
      <Card className="card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Smart Contract</CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Language</label>
            <select
              className="border rounded px-2 py-1 text-sm bg-white text-foreground"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="solidity">Solidity</option>
              <option value="cadence">Cadence</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <MonacoEditor value={source} onChange={setSource} language={monacoLang} height={560} />
          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Analysis Section */}
      {report && (
        <div ref={analysisRef}>
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Vulnerability Report</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalysisResult report={report} />
              <div className="mt-6 pt-6 border-t flex justify-end">
                <AutoFixButton
                  disabled={!report}
                  source={source}
                  language={language}
                  onApplied={(improved) => {
                    setFixedSource(improved);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI-Fixed Contract Section */}
      {fixedSource && (
        <Card ref={fixedSourceRef} className="card-glass">
          <CardHeader>
            <CardTitle>AI-Fixed Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <MonacoEditor
              value={fixedSource}
              onChange={(val) => setFixedSource(val)}
              language={monacoLang}
              height={560}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
