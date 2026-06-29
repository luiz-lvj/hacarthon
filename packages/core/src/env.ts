import path from "node:path";
import dotenv from "dotenv";
import { repoRoot } from "./paths";

let loaded = false;

/**
 * Carrega variáveis de ambiente da raiz do monorepo (.env / .env.local).
 * Na Vercel, as vars vêm do painel — não tenta ler arquivo se VERCEL=1.
 */
export function loadEnv(): void {
  if (loaded || process.env.VERCEL) return;
  const root = repoRoot();
  dotenv.config({ path: path.join(root, ".env"), override: true });
  dotenv.config({ path: path.join(root, ".env.local"), override: true });
  loaded = true;
}
