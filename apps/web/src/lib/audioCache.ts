import { randomUUID } from "node:crypto";

interface Entry {
  buffer: Buffer;
  expiresAt: number;
}

// Cache em memória para servir notas de voz ao WhatsApp via URL pública.
// Suficiente para o MVP/demo (processo único). Em produção, use storage/CDN.
const cache = new Map<string, Entry>();
const TTL_MS = 15 * 60 * 1000;

function sweep() {
  const now = Date.now();
  for (const [id, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(id);
  }
}

/** Guarda um áudio e devolve o id para montar a URL pública. */
export function putAudio(buffer: Buffer): string {
  sweep();
  const id = randomUUID();
  cache.set(id, { buffer, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function getAudio(id: string): Buffer | null {
  const entry = cache.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(id);
    return null;
  }
  return entry.buffer;
}
