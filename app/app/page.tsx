"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResult } from "@/components/AnalysisResult";
import { AutoFixButton } from "@/components/AutoFixButton";

const MonacoEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

export default function DashboardPage() {
  const [source, setSource] = useState<string>("// Paste Solidity contract here\n");
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const json = await res.json();
      setReport(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Smart Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MonacoEditor value={source} onChange={setSource} />
          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
            <AutoFixButton disabled={!report} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Vulnerability Report</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalysisResult report={report} />
        </CardContent>
      </Card>
    </div>
  );
}
