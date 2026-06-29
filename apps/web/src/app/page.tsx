import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-[#0b3d2e] via-[#14532d] to-[#166534] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:py-14 grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
        {/* Coluna do pitch */}
        <section className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-medium">
            🌱 haCARthon · Desafio 3 · Bem Público Digital
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            O <span className="text-emerald-300">Zé do CAR</span> traduz a lei
            ambiental para a língua de quem vive no campo.
          </h1>

          <p className="mt-5 text-emerald-50/90 text-lg max-w-xl">
            Um assistente de WhatsApp que explica o{" "}
            <strong>Cadastro Ambiental Rural</strong> e o{" "}
            <strong>Código Florestal</strong> em linguagem simples, com exemplos
            concretos e <strong>áudio</strong> — direto no canal que o produtor já usa.
          </p>

          <ul className="mt-7 space-y-3 max-w-xl">
            {[
              ["💬", "Fala simples", "Sem juridiquês. Responde como um vizinho que entende do assunto."],
              ["📖", "Baseado na lei", "Cada resposta cita o artigo do Código Florestal de verdade — sem inventar."],
              ["🔊", "Texto e voz", "Ouça a resposta ou mande sua dúvida falando, pra quem lê pouco."],
              ["🌍", "Código aberto", "Pensado como módulo do ecossistema CAR (RER), replicável por outros países."],
            ].map(([icon, title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="text-xl shrink-0">{icon}</span>
                <span>
                  <span className="font-semibold">{title}.</span>{" "}
                  <span className="text-emerald-50/80">{desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            <Stat value="8,2 mi" label="imóveis no CAR" />
            <Stat value="só 9%" label="cadastros validados" />
            <Stat value="WhatsApp" label="canal do produtor" />
          </div>

          <p className="mt-6 text-xs text-emerald-100/60 max-w-xl">
            O maior gargalo da validação do CAR é a comunicação com o produtor.
            Estados como MT já usam WhatsApp e o CE usa rádio. O Zé do CAR nasce
            exatamente nesse ponto.
          </p>
        </section>

        {/* Coluna do "celular" com o chat */}
        <section className="order-1 lg:order-2 flex justify-center">
          <div className="w-full max-w-[430px] h-[82vh] lg:h-[86vh] bg-black/20 rounded-[2.2rem] p-2 sm:p-3 shadow-2xl ring-1 ring-white/10">
            <div className="h-full overflow-hidden rounded-[1.6rem]">
              <Chat />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center">
      <p className="text-lg font-bold text-emerald-300">{value}</p>
      <p className="text-[11px] text-emerald-50/70 leading-tight">{label}</p>
    </div>
  );
}
