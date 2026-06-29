// API pública do @zedocar/core — usada por todos os módulos (web, whatsapp, etc.)

export type {
  ChatMessage,
  ChatResult,
  ChatSource,
  ChatRole,
  LawChunk,
  EmbeddedChunk,
  RetrievedChunk,
} from "./types";

export { getChatResponse, SYSTEM_PROMPT } from "./chat";
export { retrieve, loadKnowledge, isKnowledgeReady } from "./rag";
export { textToSpeech } from "./tts";
export { transcribe } from "./stt";
export { getOpenAI, MODELS } from "./openai";
export { extractAll, extractArticles, LAWS } from "./parse-laws";
export { repoRoot, dataDir, knowledgePath, rawLawsDir } from "./paths";
export { loadEnv } from "./env";
export { publicBaseUrl } from "./public-url";
