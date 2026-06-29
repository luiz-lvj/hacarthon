import { toFile } from "openai";
import { getOpenAI, MODELS } from "./openai";

/** Transcreve um áudio (voz do usuário) para texto, em português. */
export async function transcribe(
  buffer: Buffer,
  filename = "pergunta.webm",
  mimeType = "audio/webm",
): Promise<string> {
  const openai = getOpenAI();
  const transcription = await openai.audio.transcriptions.create({
    model: MODELS.transcription,
    file: await toFile(buffer, filename, { type: mimeType }),
    language: "pt",
  });
  return transcription.text;
}
