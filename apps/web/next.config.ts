import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "@zedocar/core";

loadEnv();

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const coreData = path.join(webRoot, "../../packages/core/data/knowledge.json");

const nextConfig: NextConfig = {
  transpilePackages: ["@zedocar/core"],
  // Garante que knowledge.json entre no bundle das funções serverless na Vercel.
  outputFileTracingIncludes: {
    "/api/chat": [coreData],
    "/api/whatsapp": [coreData],
    "/api/status": [coreData],
    "/api/tts": [coreData],
    "/api/stt": [coreData],
    "/api/voice/[id]": [coreData],
  },
};

export default nextConfig;
