import { NextResponse } from "next/server";
import { getChatResponse, type ChatMessage } from "@zedocar/core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = (body.messages ?? []).filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );
    if (messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
    }

    const result = await getChatResponse(messages);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
