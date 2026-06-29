import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedRoot: string | null = null;
let cachedDataDir: string | null = null;

const CORE_PKG_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * Encontra a raiz do monorepo subindo a partir do cwd até achar package.json
 * com "workspaces". Em produção (Vercel), pode não existir — usa cwd.
 */
export function repoRoot(): string {
  if (cachedRoot) return cachedRoot;
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.workspaces) {
          cachedRoot = dir;
          return dir;
        }
      } catch {
        // ignora package.json inválido
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  cachedRoot = process.cwd();
  return cachedRoot;
}

/** Primeiro caminho onde knowledge.json existe (core, monorepo ou cwd). */
export function dataDir(): string {
  if (cachedDataDir) return cachedDataDir;

  const candidates = [
    path.join(CORE_PKG_ROOT, "data"),
    path.join(repoRoot(), "data"),
    path.join(process.cwd(), "data"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "knowledge.json"))) {
      cachedDataDir = dir;
      return dir;
    }
  }

  // Fallback: local padrão do pacote core (antes da ingestão).
  cachedDataDir = path.join(CORE_PKG_ROOT, "data");
  return cachedDataDir;
}

export function knowledgePath(): string {
  return path.join(dataDir(), "knowledge.json");
}

export function rawLawsDir(): string {
  return path.join(dataDir(), "laws-raw");
}
