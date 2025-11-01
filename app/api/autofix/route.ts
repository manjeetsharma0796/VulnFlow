import { NextRequest } from "next/server";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const AutoFixSchema = z.object({
  improvedSource: z.string().min(1),
  language: z.enum(["solidity", "cadence"]).optional(),
  summary: z.string().min(1).optional(),
  changes: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        beforeSnippet: z.string().optional(),
        afterSnippet: z.string().optional(),
      })
    )
    .default([]),
});

type AutoFix = z.infer<typeof AutoFixSchema>;

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
      model: "gemini-2.0-flash-exp",
      temperature: 0.2,
      // maxTokens: 8192,
      // timeout: 55000, // 55s timeout (less than client timeout)
    });

    const system = `You are an expert ${LangName[language]} security engineer. Analyze the contract and produce a COMPLETE, FUNCTIONAL improved version that REMOVES ALL vulnerabilities while preserving intended behavior.

CRITICAL REQUIREMENTS:
1. Return the ENTIRE fixed contract code in the improvedSource field
2. Do NOT include markdown code fences (\`\`\`) - just the raw code
3. Preserve the original structure, imports, and comments where appropriate
4. Fix security issues (reentrancy, access control, integer overflow, etc.)
5. Ensure the code is syntactically correct and compilable

Return ONLY valid JSON matching the schema.`;

    const prompt = `${system}\n\nOriginal ${LangName[language]} contract:\n\n${source}\n\nNow provide the improved version as structured JSON:`;

    try {
      const modelWithOutput = model.withStructuredOutput(AutoFixSchema, { name: "VulnFlowAutoFix" });
      const result = (await modelWithOutput.invoke(prompt)) as AutoFix;
      
      if (!result.improvedSource || result.improvedSource.trim().length === 0) {
        throw new Error("AI returned empty code");
      }

      const finalResult: AutoFix = {
        language,
        improvedSource: result.improvedSource.trim(),
        summary: result.summary || "Code improved to fix security vulnerabilities",
        changes: result.changes || [],
      };

      return new Response(JSON.stringify(finalResult), { 
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (structError: any) {
      // Fallback: try without structured output if it fails
      console.error("Structured output failed, trying fallback:", structError);
      try {
        const rawResult = await model.invoke(prompt);
        const text = typeof rawResult.content === "string" 
          ? rawResult.content 
          : rawResult.content.map((c: any) => c.text || "").join("");
        
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*"improvedSource"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({
            language,
            improvedSource: parsed.improvedSource || text,
            summary: parsed.summary || "Code improved",
            changes: parsed.changes || [],
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        
        // Last resort: return the text as improved source
        return new Response(JSON.stringify({
          language,
          improvedSource: text.replace(/```[\w]*\n?/g, "").trim(),
          summary: "Code improved using AI",
          changes: [],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (fallbackError: any) {
        throw new Error(`AI processing failed: ${structError.message || fallbackError.message}`);
      }
    }
  } catch (e: any) {
    console.error("Auto-fix API error:", e);
    const errorMessage = e?.message || "Auto-fix failed";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? e?.stack : undefined,
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


