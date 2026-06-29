import { getOpenAI, MODELS } from "./openai";

/** Remove emojis e marcações que não soam bem quando lidos em voz. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[*_#`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Gera áudio (MP3) da resposta, em português, com voz amigável. */
export async function textToSpeech(text: string): Promise<Buffer> {
  const openai = getOpenAI();
  const speech = await openai.audio.speech.create({
    model: MODELS.tts,
    voice: process.env.ZE_TTS_VOICE || "alloy",
    input: cleanForSpeech(text).slice(0, 4000),
    instructions:
      "Fale em português do Brasil, com tom calmo, acolhedor e claro, como um agente de assistência rural conversando com um produtor. Ritmo pausado e fácil de entender.",
  });
  const arrayBuffer = await speech.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
