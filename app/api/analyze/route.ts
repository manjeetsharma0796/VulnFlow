import { NextRequest } from "next/server";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const MetricsSchema = z.object({
  overallScore: z.number().min(0).max(100),
  securityScore: z.number().min(0).max(100).optional(),
  gasScore: z.number().min(0).max(100).optional(),
  maintainabilityScore: z.number().min(0).max(100).optional(),
  cyclomaticComplexity: z.number().nonnegative().optional(),
  codeSmells: z.number().nonnegative().optional(),
  securityFlags: z.number().nonnegative().optional(),
});

const IssueSchema = z.object({
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  title: z.string().min(1),
  description: z.string().min(1),
  line: z.number().optional(),
});

const ReportSchema = z.object({
  language: z.enum(["solidity", "cadence"]).optional(),
  metrics: MetricsSchema.optional(),
  issues: z.array(IssueSchema).default([]),
});

type Report = z.infer<typeof ReportSchema>;

enum LangName {
  solidity = "Solidity",
  cadence = "Cadence",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source: string = body?.source;
    const language: "solidity" | "cadence" = body?.language === "cadence" ? "cadence" : "solidity";
    if (!source || typeof source !== "string") {
      return new Response(JSON.stringify({ error: "Missing source" }), { status: 400 });
    }
    if (!process.env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: "GOOGLE_API_KEY not configured" }), { status: 500 });
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.0-flash",
      temperature: 0.2,
    }).withStructuredOutput(ReportSchema, { name: "VulnFlowAuditReport" });

    const system = `You are an expert ${LangName[language]} security auditor. Return JSON that strictly matches the schema.\n\nMetrics must include: overallScore (0-100) and, where possible, securityScore, gasScore, maintainabilityScore (all 0-100). Also include cyclomaticComplexity, codeSmells, and securityFlags counts when you can infer them.\n\nIssues must each include title, description, and severity (Critical, High, Medium, Low). Include a line number if evident.`;

    const prompt = `${system}\n\nContract (${LangName[language]}):\n\n${source}`;

    const result = (await model.invoke(prompt)) as Report;
    const finalResult: Report = { language, metrics: result.metrics, issues: result.issues };
    return new Response(JSON.stringify(finalResult), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Analyze failed" }), { status: 500 });
  }
}
