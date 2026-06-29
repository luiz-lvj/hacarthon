/** URL pública do app (túnel local, Vercel, etc.). Usada para áudio no WhatsApp. */
export function publicBaseUrl(): string {
  if (process.env.PUBLIC_BASE_URL?.trim()) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  // Vercel define VERCEL_URL automaticamente (sem https://).
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "";
}
