/**
 * Copia knowledge.json para apps/web/data/ antes do build (Vercel/serverless).
 * No runtime, process.cwd()/data/knowledge.json é o caminho confiável.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destDir = path.join(webRoot, "data");
const dest = path.join(destDir, "knowledge.json");

const sources = [
  path.join(webRoot, "../../packages/core/data/knowledge.json"),
  path.join(webRoot, "data/knowledge.json"),
];

const src = sources.find((p) => fs.existsSync(p));

if (!src) {
  console.error("ERRO: knowledge.json não encontrado. Rode `npm run ingest` na raiz.");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`✓ knowledge.json copiado para apps/web/data/ (${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
