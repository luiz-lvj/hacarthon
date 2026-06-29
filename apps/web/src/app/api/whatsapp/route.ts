import twilio from "twilio";
import { getChatResponse, transcribe, textToSpeech, publicBaseUrl, type ChatMessage } from "@zedocar/core";
import { putAudio } from "@/lib/audioCache";

export const runtime = "nodejs";

/**
 * Memória de conversa simples por número (em memória do processo).
 * Para produção, troque por Redis / banco. Suficiente para o MVP/demo.
 */
const HISTORY = new Map<string, ChatMessage[]>();
const MAX_TURNS = 8;

function xml(twiml: twilio.twiml.MessagingResponse): Response {
  return new Response(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function textReply(message: string): Response {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return xml(twiml);
}

/** Baixa a mídia recebida do Twilio (precisa de autenticação básica). */
async function fetchTwilioMedia(url: string): Promise<{ buffer: Buffer; type: string } | null> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  const res = await fetch(url, {
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64") },
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") || "audio/ogg";
  return { buffer: Buffer.from(await res.arrayBuffer()), type };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [k, v] of form) params[k] = String(v);

    // Validação opcional da assinatura do Twilio.
    if (process.env.TWILIO_VALIDATE === "true" && process.env.TWILIO_AUTH_TOKEN) {
      const signature = req.headers.get("x-twilio-signature") || "";
      const base = publicBaseUrl();
      const url = `${base}/api/whatsapp`;
      const valid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        signature,
        url,
        params,
      );
      if (!valid) {
        console.warn("[/api/whatsapp] assinatura inválida");
        return new Response("Forbidden", { status: 403 });
      }
    }

    const from = String(params.From || "anon");
    let incoming = String(params.Body || "").trim();

    // Mensagem de voz: baixa e transcreve (Whisper).
    const numMedia = parseInt(params.NumMedia || "0", 10);
    if (numMedia > 0 && (params.MediaContentType0 || "").startsWith("audio")) {
      const media = await fetchTwilioMedia(params.MediaUrl0);
      if (media) {
        try {
          incoming = (await transcribe(media.buffer, "audio.ogg", media.type)).trim();
        } catch (e) {
          console.error("[/api/whatsapp] falha ao transcrever áudio", e);
        }
      }
    }

    if (!incoming) {
      return textReply(
        "Oi! Eu sou o Zé do CAR 🌱 Pode me mandar sua dúvida sobre o Cadastro Ambiental Rural ou o Código Florestal — por texto ou áudio — que eu te explico de um jeito simples.",
      );
    }

    const history = HISTORY.get(from) ?? [];
    history.push({ role: "user", content: incoming });

    const { answer, sources } = await getChatResponse(history);

    history.push({ role: "assistant", content: answer });
    HISTORY.set(from, history.slice(-MAX_TURNS * 2));

    const ref = sources[0] ? `\n\n📖 Base: ${sources[0].source}, ${sources[0].article}` : "";

    const twiml = new twilio.twiml.MessagingResponse();
    const msg = twiml.message(answer + ref);

    // Resposta em áudio (nota de voz), se habilitado e com URL pública.
    const base = publicBaseUrl();
    if (process.env.ZE_WHATSAPP_AUDIO !== "false" && base) {
      try {
        const audio = await textToSpeech(answer);
        const id = putAudio(audio);
        msg.media(`${base}/api/voice/${id}`);
      } catch (e) {
        console.error("[/api/whatsapp] falha ao gerar áudio", e);
      }
    }

    return xml(twiml);
  } catch (err) {
    console.error("[/api/whatsapp]", err);
    return textReply(
      "Tive um problema técnico agora 😕. Tenta de novo daqui a pouco, ou acesse car.gov.br.",
    );
  }
}
