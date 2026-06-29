import { NextResponse } from "next/server";
import { textToSpeech } from "@zedocar/core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
    }
    const audio = await textToSpeech(text);
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/tts]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
