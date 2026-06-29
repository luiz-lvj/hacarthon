import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedRoot: string | null = null;
let cachedDataDir: string | null = null;

const CORE_PKG_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

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

/** Onde está knowledge.json — prioriza apps/web/data (Vercel/serverless). */
export function dataDir(): string {
  if (cachedDataDir) return cachedDataDir;

  const root = repoRoot();
  const candidates = [
    process.env.KNOWLEDGE_DATA_DIR,
    path.join(process.cwd(), "data"),
    path.join(root, "apps", "web", "data"),
    path.join(root, "packages", "core", "data"),
    path.join(CORE_PKG_ROOT, "data"),
    path.join(root, "data"),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "knowledge.json"))) {
      cachedDataDir = dir;
      return dir;
    }
  }

  cachedDataDir = path.join(process.cwd(), "data");
  return cachedDataDir;
}

export function knowledgePath(): string {
  return path.join(dataDir(), "knowledge.json");
}

export function rawLawsDir(): string {
  return path.join(dataDir(), "laws-raw");
}
