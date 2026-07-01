# Atendente de IA — Atacadão das Bikes

Bot que **aconselha e atende** clientes no **site** e no **WhatsApp**, usando o mesmo
"cérebro" (um código só). Cérebro = **Google Gemini** (plano gratuito). A
arquitetura permite trocar pelo **Claude (API)** depois, mexendo só nas funções.

```
                 ┌────────────── Cérebro (Netlify Functions) ──────────────┐
  Site (widget) ─┤  lib/shared.ts: system prompt do catálogo + Gemini        ├─→ Google Gemini
  WhatsApp ──────┤  chat.ts (site) · whatsapp.ts (webhook Meta)             │
                 └─────────────────────────────────────────────────────────┘
```

A **chave da IA nunca fica no frontend** — só nas variáveis de ambiente do servidor.

---

## Arquivos

| Arquivo | O que faz |
|---|---|
| `netlify/lib/shared.ts` | Cérebro: monta o system prompt do catálogo e fala com o Gemini (streaming e texto). |
| `netlify/functions/chat.ts` | Endpoint do **site** (`/.netlify/functions/chat`), resposta em streaming. |
| `netlify/functions/lead.ts` | Extrai os dados do cliente da conversa em JSON (alimenta o CRM). |
| `netlify/functions/whatsapp.ts` | **Webhook do WhatsApp** (Meta Cloud API). |
| `src/pages/admin/CrmAdmin.tsx` | Aba **CRM** no painel: leads, estágios, WhatsApp e transcrição. |
| `netlify/lib/catalog.ts` | Cópia do catálogo usada pelo WhatsApp (manter em sincronia com `src/data/seed.ts`). |
| `src/components/chat/ChatWidget.tsx` | Bolha de chat do site. |
| `src/lib/chatClient.ts` | Cliente que conversa com a função e envia o catálogo vivo do site. |

---

## Passo 1 — Chave grátis do Gemini (obrigatório)

1. Acesse **https://aistudio.google.com/apikey** (login Google).
2. Clique em **Create API key** e copie a chave.
3. Local: copie `.env.example` para `.env` e cole em `GEMINI_API_KEY`.
4. Produção: cole no painel da Netlify (passo 3).

> Modelo padrão: `gemini-2.5-flash` (o `2.0-flash` pode vir com cota gratuita 0 em
> algumas contas). Para trocar, use a variável `GEMINI_MODEL`.

> Plano gratuito tem limite diário de requisições — suficiente para uma loja
> pequena/média. Sem cartão. Sem custo.

## Passo 2 — Testar localmente

O `npm run dev` (Vite) **não** roda as funções. Para testar o bot, use a CLI da Netlify:

```bash
npx netlify dev
```

Isso sobe o site **e** as funções juntos. Abra o endereço que a CLI mostrar e
clique na bolha de atendimento. (Garanta que o `.env` tem a `GEMINI_API_KEY`.)

## Passo 3 — Deploy (Netlify)

1. No painel da Netlify: **Site settings → Environment variables**.
2. Adicione `GEMINI_API_KEY` com a sua chave.
3. Faça o deploy normal. O site já chama `/.netlify/functions/chat`.

Pronto: o atendimento no **site** está no ar.

---

## Passo 4 — WhatsApp (Fase 2)

Automatizar o WhatsApp exige a **API oficial (Meta Cloud API)**. Resumo:

1. **Número dedicado**: o número que entra na API **deixa de funcionar no app normal**.
   Use um chip novo só pro bot, ou migre o número atual (e perde o uso manual nele).
2. **Conta Meta Business + verificação da empresa** em https://business.facebook.com.
3. Crie um app em https://developers.facebook.com → adicione **WhatsApp**.
4. Em **WhatsApp → API Setup**, pegue:
   - **Access token** → variável `WHATSAPP_TOKEN`
   - **Phone number ID** → variável `WHATSAPP_PHONE_NUMBER_ID`
5. Invente um texto qualquer para `WHATSAPP_VERIFY_TOKEN` (ex.: `atacadao-bikes-2026`).
6. Configure as 3 variáveis na Netlify (igual ao passo 3).
7. Em **Configuration → Webhooks**, cadastre:
   - **Callback URL**: `https://SEU-SITE.netlify.app/.netlify/functions/whatsapp`
   - **Verify token**: o mesmo valor de `WHATSAPP_VERIFY_TOKEN`
   - Clique em **Verify and save** e **assine** o campo `messages`.

A partir daí, mensagens recebidas são respondidas pela mesma IA do site.

> **Custo no WhatsApp:** a Meta hoje deixa **gratuitas as conversas de atendimento**
> (cliente manda primeiro e você responde em até 24h). O cérebro (Gemini) também é
> grátis no plano gratuito. Políticas da Meta podem mudar.

---

## Custos e limites

- **Gemini (free):** R$ 0 dentro do limite diário. Se o tráfego crescer muito, pode
  bater o teto do plano gratuito (aí dá pra subir de plano ou trocar pelo Claude).
- **Proteções já embutidas:** rate limiting por IP no site, limite de histórico e de
  tamanho de mensagem, resposta com tamanho máximo.

## Manutenção do catálogo

- **Site:** o widget envia o catálogo vivo da loja automaticamente — reflete o que
  está em `src/data/seed.ts` (e edições do admin no mesmo navegador).
- **WhatsApp:** usa a cópia em `netlify/lib/catalog.ts`. Ao mudar produtos/preços,
  atualize essa cópia também. (Quando o catálogo virar banco — Supabase — os dois
  canais passam a ler da mesma fonte e isso deixa de ser necessário.)

## CRM e Conversas (atendimento)

O atendente tem como **objetivo mínimo** captar 3 coisas: **nome, número e pedido**
(o que o cliente quer). Captura também orçamento/cidade quando dá.

Ao encerrar o chat (fechar ou sair da página):
1. a **conversa inteira é salva** no sistema (de graça, sem IA);
2. uma única chamada a `/.netlify/functions/lead` extrai os dados do cliente em JSON.

No painel:
- **Conversas** (`/admin/conversas`): inbox com **todas as conversas** do site, a
  transcrição completa, o status do **site vinculado** e um botão para **ligar/desligar
  o atendimento** no site (o widget some quando desligado).
- **CRM** (`/admin/crm`): só os leads **com dados** (nome/número/pedido), com estágio
  (novo → em atendimento → qualificado → fechado/perdido) e botão de WhatsApp pro cliente.

> ⚠️ **Limitação atual:** os leads são salvos no navegador (localStorage), igual ao
> resto do protótipo. Isso significa que o admin vê os leads capturados **no mesmo
> navegador**. Para centralizar leads de qualquer visitante/dispositivo num lugar só,
> o próximo passo é persistir no **Supabase** (a função `lead.ts` já é o ponto certo
> para gravar no banco). Enquanto isso, o bot também encaminha o cliente pro WhatsApp,
> garantindo que a loja receba o contato.

## Trocar pelo Claude (futuro)

A troca é localizada: reimplemente `geminiText`/`geminiStream` em
`netlify/lib/shared.ts` chamando a API da Anthropic e troque a variável de
ambiente. O widget, o webhook e o resto continuam iguais.

> Lembrete: o **Claude Max** (assinatura) **não** cobre a API. O Claude no bot é
> cobrado à parte (pré-pago por uso no console.anthropic.com).
