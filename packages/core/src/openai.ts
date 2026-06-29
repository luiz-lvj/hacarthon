import OpenAI from "openai";

let client: OpenAI | null = null;

/** Cliente OpenAI compartilhado. Lê a chave de OPENAI_API_KEY. */
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY não configurada. Crie um arquivo .env.local com OPENAI_API_KEY=sk-...",
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const MODELS = {
  /** Modelo de conversa. Troque por gpt-4o para máxima qualidade. */
  chat: process.env.ZE_CHAT_MODEL || "gpt-4o-mini",
  /** Modelo de embeddings para o RAG. */
  embedding: process.env.ZE_EMBEDDING_MODEL || "text-embedding-3-small",
  /** Modelo de transcrição de áudio (voz -> texto). */
  transcription: process.env.ZE_STT_MODEL || "whisper-1",
  /** Modelo de síntese de voz (texto -> áudio). */
  tts: process.env.ZE_TTS_MODEL || "gpt-4o-mini-tts",
} as const;
