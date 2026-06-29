import fs from "node:fs";
import { getOpenAI, MODELS } from "./openai";
import { knowledgePath } from "./paths";
import type { EmbeddedChunk, RetrievedChunk } from "./types";

let knowledge: EmbeddedChunk[] | null = null;

/** Carrega a base de conhecimento (lazy, com cache em memória). */
export function loadKnowledge(): EmbeddedChunk[] {
  if (knowledge) return knowledge;
  const file = knowledgePath();
  if (!fs.existsSync(file)) {
    throw new Error(
      "Base de conhecimento não encontrada. Rode `npm run ingest` e faça redeploy (o build copia para apps/web/data/).",
    );
  }
  knowledge = JSON.parse(fs.readFileSync(file, "utf-8")) as EmbeddedChunk[];
  return knowledge;
}

export function isKnowledgeReady(): boolean {
  return fs.existsSync(knowledgePath());
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedQuery(query: string): Promise<number[]> {
  const openai = getOpenAI();
  const res = await openai.embeddings.create({
    model: MODELS.embedding,
    input: query,
  });
  return res.data[0].embedding;
}

/** Recupera os trechos da legislação mais relevantes para a pergunta. */
export async function retrieve(query: string, topK = 5): Promise<RetrievedChunk[]> {
  const base = loadKnowledge();
  const queryEmbedding = await embedQuery(query);
  return base
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ embedding, ...rest }) => {
      void embedding;
      return rest;
    });
}
