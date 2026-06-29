import { NextResponse } from "next/server";
import { isKnowledgeReady, loadKnowledge } from "@zedocar/core";

export const runtime = "nodejs";

export async function GET() {
  const ready = isKnowledgeReady();
  let articles = 0;
  if (ready) {
    try {
      articles = loadKnowledge().length;
    } catch {
      articles = 0;
    }
  }
  return NextResponse.json({
    knowledgeReady: ready,
    articles,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
  });
}
