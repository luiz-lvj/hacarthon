import { NextResponse } from "next/server";
import { transcribe } from "@zedocar/core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Áudio não enviado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await transcribe(buffer, "pergunta.webm", file.type || "audio/webm");
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/stt]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
