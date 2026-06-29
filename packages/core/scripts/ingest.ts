/**
 * Ingestão da base de conhecimento do Zé do CAR.
 *
 * Lê os textos oficiais (Código Florestal e Decreto 7.830/2012) em data/laws-raw/,
 * quebra cada norma em artigos, gera embeddings com a OpenAI e grava
 * data/knowledge.json (usado pelo RAG em tempo de execução).
 *
 * Uso (na raiz):  npm run ingest
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "../src/env";
import { getOpenAI, MODELS } from "../src/openai";
import { extractAll } from "../src/parse-laws";
import { knowledgePath } from "../src/paths";
import type { EmbeddedChunk, LawChunk } from "../src/types";

loadEnv();

async function embedAll(chunks: LawChunk[]): Promise<EmbeddedChunk[]> {
  const openai = getOpenAI();
  const out: EmbeddedChunk[] = [];
  const batchSize = 64;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: MODELS.embedding,
      input: batch.map((c) => `${c.source} — ${c.article}\n${c.text}`),
    });
    res.data.forEach((d, j) => out.push({ ...batch[j], embedding: d.embedding }));
    console.log(`  embeddings: ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`);
  }
  return out;
}

async function main() {
  console.log("Lendo e quebrando as normas em artigos...");
  const chunks = extractAll();
  console.log(`Total: ${chunks.length} artigos.`);

  console.log("Gerando embeddings na OpenAI...");
  const embedded = await embedAll(chunks);

  const out = knowledgePath();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(embedded));
  console.log(`OK! Base salva em ${out} (${embedded.length} trechos).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
