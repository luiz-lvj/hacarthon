"use client";

import { useEffect, useRef, useState } from "react";

interface Source {
  source: string;
  article: string;
  url: string;
  snippet: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  error?: boolean;
}

const GREETING: Message = {
  role: "assistant",
  content:
    "Oi! Eu sou o Zé do CAR 🌱\n\nTô aqui pra te ajudar a entender o Cadastro Ambiental Rural e o Código Florestal sem complicação. Pode perguntar com suas palavras que eu explico simples.",
};

const SUGGESTIONS = [
  "O que é Reserva Legal?",
  "Preciso mesmo fazer o CAR?",
  "O que é APP?",
  "Posso ser multado se não regularizar?",
  "Como o CAR ajuda a conseguir crédito?",
];

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const userMsg: Message = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => !m.error)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao responder.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ops, deu um problema aqui: ${msg}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function speak(idx: number, text: string) {
    if (speakingIdx === idx) {
      audioRef.current?.pause();
      setSpeakingIdx(null);
      return;
    }
    try {
      setSpeakingIdx(idx);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Falha no áudio");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeakingIdx(null);
      await audio.play();
    } catch {
      setSpeakingIdx(null);
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "pergunta.webm");
        setLoading(true);
        try {
          const res = await fetch("/api/stt", { method: "POST", body: form });
          const data = await res.json();
          setLoading(false);
          if (data.text) await send(data.text);
        } catch {
          setLoading(false);
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Não consegui acessar o microfone. Verifique a permissão do navegador.");
    }
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden rounded-none sm:rounded-3xl shadow-2xl bg-white text-[#111b21]">
      {/* Cabeçalho estilo WhatsApp */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white shrink-0">
        <div className="h-10 w-10 rounded-full bg-[#22c55e] grid place-items-center text-xl shadow-inner">
          🌱
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <p className="font-semibold">Zé do CAR</p>
          <p className="text-xs text-emerald-100/90">
            {loading ? "digitando…" : "online • assistente do CAR"}
          </p>
        </div>
        <span className="text-[10px] bg-emerald-900/40 px-2 py-1 rounded-full">
          Lei 12.651/2012
        </span>
      </header>

      {/* Área de mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto wa-pattern px-3 py-4 space-y-2">
        <div className="mx-auto mb-2 max-w-[80%] text-center text-[11px] text-stone-600 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-1.5">
          🔒 Informações com base na lei. O Zé orienta, mas não substitui o órgão
          ambiental do seu estado.
        </div>

        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            message={m}
            index={i}
            speaking={speakingIdx === i}
            onSpeak={speak}
          />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="wa-msg bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="dot h-2 w-2 rounded-full bg-stone-400" />
                <span className="dot h-2 w-2 rounded-full bg-stone-400" />
                <span className="dot h-2 w-2 rounded-full bg-stone-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sugestões rápidas */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-3 py-2 bg-[#efeae2] border-t border-black/5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs sm:text-sm bg-white text-emerald-800 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-50 transition shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Caixa de entrada */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 px-3 py-3 bg-[#f0f2f5] shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua dúvida…"
          className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-[#111b21] placeholder:text-stone-400 outline-none border border-transparent focus:border-emerald-300"
        />
        <button
          type="button"
          onClick={toggleRecording}
          title="Falar"
          className={`h-11 w-11 grid place-items-center rounded-full shrink-0 transition ${
            recording ? "bg-red-500 text-white animate-pulse" : "bg-white text-emerald-700"
          }`}
        >
          {recording ? "■" : "🎤"}
        </button>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-11 w-11 grid place-items-center rounded-full bg-[#075e54] text-white shrink-0 disabled:opacity-40"
          title="Enviar"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  index,
  speaking,
  onSpeak,
}: {
  message: Message;
  index: number;
  speaking: boolean;
  onSpeak: (idx: number, text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`wa-msg max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap text-[#111b21] ${
          isUser
            ? "bg-[#d9fdd3] rounded-2xl rounded-tr-sm"
            : message.error
              ? "bg-red-50 text-red-700 rounded-2xl rounded-tl-sm border border-red-200"
              : "bg-white rounded-2xl rounded-tl-sm"
        }`}
      >
        <p>{message.content}</p>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((s, j) => (
              <a
                key={j}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.snippet}
                className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5 hover:bg-emerald-100"
              >
                📖 {s.source}, {s.article}
              </a>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-end gap-2">
          {!isUser && !message.error && (
            <button
              onClick={() => onSpeak(index, message.content)}
              className="text-[11px] text-emerald-700 hover:underline"
            >
              {speaking ? "⏸ parar" : "🔊 ouvir"}
            </button>
          )}
          <span className="text-[10px] text-stone-400">{nowTime()}</span>
        </div>
      </div>
    </div>
  );
}
