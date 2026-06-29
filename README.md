# 🌱 Zé do CAR

**Assistente que traduz a legislação ambiental para a língua de quem vive no campo.**

Projeto para o **haCARthon** — Desafio 3: *Aumentar o entendimento das Legislações do CAR*.

O **Zé do CAR** é um assistente conversacional (web + WhatsApp) que explica o
**Cadastro Ambiental Rural (CAR)** e o **Código Florestal** (Lei nº 12.651/2012 e
Decreto nº 7.830/2012) em **linguagem simples**, com **exemplos concretos** e
**resposta em áudio** — no canal que o produtor rural já usa no dia a dia.

Cada resposta é **fundamentada na lei** (RAG sobre o texto oficial) e **cita o artigo**
de origem, para reduzir alucinação e dar segurança ao produtor e ao analista.

---

## Por que isso importa

- O maior gargalo da validação do CAR hoje é a **comunicação com o produtor**: muitos
  não entendem ou não respondem às notificações. Estados como **Mato Grosso já usam
  WhatsApp** e o **Ceará usa rádio** para reduzir esse problema
  ([CPI, Radiografia do CAR e PRA – 2025](https://www.climatepolicyinitiative.org/pt-br/publication/onde-estamos-na-implementacao-do-codigo-florestal-radiografia-do-car-e-do-pra-nos-estados-brasileiros-edicao-2025/)).
- A persona-alvo (o "Seu Raimundo") se informa por **WhatsApp, rádio e TikTok**, confia
  em **exemplos concretos** e tem **pouca familiaridade com termos jurídicos**.
- O CAR está sendo construído como um **Bem Público Digital** de código aberto
  (ver [RER](https://github.com/Rural-Environmental-Registry/core)). O Zé do CAR nasce
  alinhado a esse ecossistema, como um módulo de **comunicação e educação** replicável.

---

## Como funciona (arquitetura)

```
Usuário (Web estilo WhatsApp  /  WhatsApp real via Twilio)
        │
        ▼
  /api/chat ──► RAG (embeddings + busca por similaridade na legislação)
        │            └─ data/knowledge.json (artigos + embeddings)
        ▼
  OpenAI (gera resposta simples, citando o artigo)
        │
        ├─► /api/tts  (texto → áudio, voz em PT-BR)
        └─► /api/stt  (áudio do usuário → texto, Whisper)
```

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 — interface com cara
  de WhatsApp, respostas rápidas, áudio e gravação por voz.
- **Cérebro:** RAG simples e transparente. Os textos oficiais são quebrados **por artigo**,
  vetorizados e consultados por similaridade de cosseno. Sem banco vetorial externo — só
  um `knowledge.json`, fácil de auditar.
- **IA:** OpenAI (chat, embeddings, TTS e Whisper), configurável por variável de ambiente.

---

## Deploy (Vercel + WhatsApp)

Guia completo passo a passo: **[DEPLOY.md](./DEPLOY.md)**

Resumo: importe o repo na Vercel com **Root Directory = `apps/web`**, configure as env vars (OpenAI + Twilio), faça deploy e aponte o webhook do Twilio para `https://seu-projeto.vercel.app/api/whatsapp`.

## Materiais do haCARthon

| Arquivo | Descrição |
|---------|-----------|
| [docs/APRESENTACAO.html](./docs/APRESENTACAO.html) | Slides da apresentação (abrir no navegador; ← → para navegar) |
| [docs/IDEACAO.md](./docs/IDEACAO.md) | Respostas completas para o formulário de ideação e protótipo |
| [docs/zedocar-logo.png](./docs/zedocar-logo.png) | Logomarca (upload no formulário) |

---

## Rodando localmente

Pré-requisitos: **Node.js 20+**.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar a chave da OpenAI
cp .env.example .env.local
# edite .env.local e preencha OPENAI_API_KEY=sk-...

# 3. Gerar a base de conhecimento (lê data/laws-raw/ e cria data/knowledge.json)
npm run ingest

# 4. Subir o app
npm run dev
# abra http://localhost:3000
```

> Os textos oficiais das leis já vêm em `data/laws-raw/`. Para reatualizá-los, baixe de
> novo do Planalto (links em `src/lib/parse-laws.ts`).

---

## WhatsApp de verdade (Twilio Sandbox)

1. Crie uma conta no [Twilio](https://www.twilio.com/) e ative o **WhatsApp Sandbox**.
2. Exponha seu `localhost` (ex.: `ngrok http 3000`).
3. No painel do sandbox, configure o webhook de mensagens para:
   `https://SEU_DOMINIO/api/whatsapp` (método POST).
4. Mande mensagem para o número do sandbox e converse com o Zé.

A interface web (estilo WhatsApp) funciona sem o Twilio e é a recomendada para a demo.

---

## Estrutura

```
src/
  app/
    page.tsx              # landing + chat
    api/chat/route.ts     # pergunta → resposta (RAG + LLM)
    api/tts/route.ts      # texto → áudio
    api/stt/route.ts      # áudio → texto (Whisper)
    api/whatsapp/route.ts # webhook do Twilio (WhatsApp)
    api/status/route.ts   # saúde da base de conhecimento
  components/Chat.tsx      # interface estilo WhatsApp
  lib/
    parse-laws.ts          # quebra as leis em artigos
    rag.ts                 # busca por similaridade
    chat.ts                # persona do Zé + montagem do prompt
    tts.ts                 # síntese de voz
scripts/
  ingest.ts                # gera data/knowledge.json
data/
  laws-raw/                # HTML oficial das normas (Planalto)
```

---

## Limitações e próximos passos

- O Zé **orienta**, mas não substitui o órgão ambiental estadual nem dá parecer jurídico.
- **Roadmap:** explicar notificações de pendência do CAR em linguagem simples;
  diagnóstico por imóvel (puxando dados públicos do SICAR); conteúdo viral para redes.

## Licença

[MIT](./LICENSE) — software livre, no espírito de Bem Público Digital.
