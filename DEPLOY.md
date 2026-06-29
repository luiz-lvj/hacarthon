# Deploy na Vercel + WhatsApp (Twilio)

Guia passo a passo para colocar o **Zé do CAR** no ar e testar no WhatsApp.

---

## Pré-requisitos

- Conta no [GitHub](https://github.com) (repositório com este código)
- Conta na [Vercel](https://vercel.com)
- Conta no [Twilio](https://console.twilio.com) com **WhatsApp Sandbox** ativo
- Chave da **OpenAI** com crédito

---

## 1. Subir o código pro GitHub

Na raiz do projeto:

```bash
git add .
git commit -m "Prepara deploy Vercel e WhatsApp"
git push origin main
```

> **Importante:** o arquivo `packages/core/data/knowledge.json` (~3,4 MB) **precisa ir pro repositório** — é a base da lei que o bot usa. Os HTMLs em `packages/core/data/laws-raw/` também.

---

## 2. Criar projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. **Import** o repositório do GitHub
3. Em **Configure Project**, ajuste:

| Campo | Valor |
|-------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` ← clique em *Edit* e selecione |

4. **Não clique em Deploy ainda** — configure as variáveis primeiro (passo 3).

O arquivo `apps/web/vercel.json` já define os comandos do monorepo:

- `prebuild`: copia `packages/core/data/knowledge.json` → `apps/web/data/` (obrigatório na Vercel)
- `installCommand`: instala dependências na raiz (`npm install`)
- `buildCommand`: build do workspace `@zedocar/web`

---

## 3. Variáveis de ambiente (Vercel)

Em **Settings → Environment Variables**, adicione **todas** para **Production**, **Preview** e **Development**:

| Variável | Obrigatória | Valor |
|----------|-------------|--------|
| `OPENAI_API_KEY` | ✅ | `sk-proj-...` |
| `TWILIO_ACCOUNT_SID` | ✅ | `AC...` (Console Twilio) |
| `TWILIO_AUTH_TOKEN` | ✅ | token do Console |
| `TWILIO_WHATSAPP_FROM` | ✅ | `whatsapp:+14155238886` (número do sandbox) |
| `ZE_WHATSAPP_AUDIO` | opcional | `true` (resposta em áudio) |
| `ZE_CHAT_MODEL` | opcional | `gpt-4o-mini` |
| `PUBLIC_BASE_URL` | opcional | deixe vazio — a Vercel preenche via `VERCEL_URL` automaticamente |

> **Não** commite `.env` no git. Só configure no painel da Vercel.

---

## 4. Deploy

1. Clique **Deploy**
2. Aguarde o build (~2–3 min)
3. Anote a URL: `https://seu-projeto.vercel.app`

### Verificar se está OK

Abra no navegador:

```
https://seu-projeto.vercel.app/api/status
```

Deve retornar algo como:

```json
{"knowledgeReady":true,"articles":111,"hasApiKey":true}
```

Teste o chat em:

```
https://seu-projeto.vercel.app
```

---

## 5. Configurar WhatsApp (Twilio Sandbox)

1. Console Twilio → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Em **Sandbox settings** → **When a message comes in**:
   - URL: `https://seu-projeto.vercel.app/api/whatsapp`
   - Método: **POST**
3. **Save**

### Conectar seu celular

Na mesma página, envie do **seu WhatsApp** para o número do sandbox a mensagem de adesão, por exemplo:

```
join <duas-palavras>
```

(o código exato aparece na tela do Twilio)

---

## 6. Testar no WhatsApp

Mande mensagens como:

- `O que é Reserva Legal?`
- `Preciso fazer o CAR?`
- 🎤 ou envie um **áudio** com sua dúvida

O Zé responde em texto (+ áudio se `ZE_WHATSAPP_AUDIO=true`).

---

## Solução de problemas

| Problema | O que fazer |
|----------|-------------|
| `/api/status` → `knowledgeReady: false` | Confirme que `packages/core/data/knowledge.json` foi commitado e o deploy incluiu o arquivo |
| Resposta genérica de erro no WhatsApp | Veja **Vercel → Project → Logs** e confira `OPENAI_API_KEY` |
| Twilio não chama o webhook | URL correta? Método POST? Projeto deployado? |
| Áudio não chega no WhatsApp | `ZE_WHATSAPP_AUDIO=true`; URL pública acessível (`/api/voice/...`) |
| Build falha no monorepo | Root Directory = `apps/web`; verifique logs do `npm install` na raiz |

---

## Redeploy após mudanças

Cada `git push` na branch conectada dispara redeploy automático na Vercel.

Para regenerar a base de conhecimento localmente:

```bash
npm run ingest
git add packages/core/data/knowledge.json
git commit -m "Atualiza base de conhecimento"
git push
```

---

## Resumo rápido

```
GitHub → Vercel (root: apps/web) → env vars → Deploy
       → Twilio webhook: https://XXX.vercel.app/api/whatsapp
       → Celular: join sandbox → testar
```
