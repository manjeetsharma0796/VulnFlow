import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();
    if (!process.env.AI_API_URL) {
      return new Response(JSON.stringify({ error: "AI_API_URL not configured" }), { status: 500 });
    }
    const res = await fetch(process.env.AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Analyze failed" }), { status: 500 });
  }
}
