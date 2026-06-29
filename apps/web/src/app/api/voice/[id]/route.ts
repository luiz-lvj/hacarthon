import { NextResponse } from "next/server";
import { getAudio } from "@/lib/audioCache";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const audio = getAudio(id);
  if (!audio) {
    return NextResponse.json({ error: "Áudio expirado ou inexistente." }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(audio), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=900",
    },
  });
}
