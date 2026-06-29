export interface LawChunk {
  /** Identificador único, ex: "lei-12651-art-12" */
  id: string;
  /** Nome curto da norma, ex: "Lei 12.651/2012 (Código Florestal)" */
  law: string;
  /** Sigla curta usada em citações, ex: "Código Florestal" */
  source: string;
  /** Rótulo do artigo, ex: "Art. 12" */
  article: string;
  /** Texto limpo do artigo */
  text: string;
  /** URL oficial da norma */
  url: string;
}

export interface EmbeddedChunk extends LawChunk {
  embedding: number[];
}

export interface RetrievedChunk extends LawChunk {
  score: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSource {
  source: string;
  article: string;
  url: string;
  snippet: string;
}

export interface ChatResult {
  answer: string;
  sources: ChatSource[];
}
