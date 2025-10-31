import { NextRequest } from "next/server";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const IssueSchema = z.object({
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  title: z.string().min(1),
  description: z.string().min(1),
  line: z.number().optional(),
});

const ReportSchema = z.object({
  issues: z.array(IssueSchema).default([]),
});

type Report = z.infer<typeof ReportSchema>;

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();
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

    const system = `You are an expert Solidity security auditor. Analyze the provided contract code and return a JSON object strictly matching the given schema with an "issues" array. Each issue must include a clear title, a concise description, and one of the severities: Critical, High, Medium, Low. Include a line number if evident.`;

    const prompt = `${system}\n\nContract:\n\n${source}`;

    const result = (await model.invoke(prompt)) as Report;

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Analyze failed" }), { status: 500 });
  }
}
