import type { NextConfig } from "next";
import { loadEnv } from "@zedocar/core";

loadEnv();

const nextConfig: NextConfig = {
  transpilePackages: ["@zedocar/core"],
  // knowledge.json fica em apps/web/data/ (copiado no prebuild).
  outputFileTracingIncludes: {
    "/api/chat": ["./data/knowledge.json"],
    "/api/whatsapp": ["./data/knowledge.json"],
    "/api/status": ["./data/knowledge.json"],
    "/api/tts": ["./data/knowledge.json"],
    "/api/stt": ["./data/knowledge.json"],
    "/api/voice/[id]": ["./data/knowledge.json"],
  },
};

export default nextConfig;
