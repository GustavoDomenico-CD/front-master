This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Sistema: front + [backend-edge-main](https://github.com/GustavoDomenico-CD/backend-edge-main)

Este repositório é o painel Next.js. O backend é o NestJS do link acima; juntos formam um único sistema.

### Backend (Nest)

1. Clone [backend-edge-main](https://github.com/GustavoDomenico-CD/backend-edge-main).
2. Copie `.env.example` para `.env`, ajuste `DATABASE_URL` / `JWT_SECRET` se precisar.
3. Defina `FRONTEND_URL=http://localhost:3000` no `.env` do backend para CORS com cookies em desenvolvimento.
4. `npx prisma migrate dev` (se necessário), depois `npm run start:dev` (porta padrão **3001**).

### Front (este repo)

1. Copie `.env.local.example` para `.env.local`.
2. Confirme `BACKEND_URL=http://127.0.0.1:3001` (ou a URL do deploy da API).
3. `npm install` e `npm run dev` → [http://localhost:3000](http://localhost:3000).

As rotas `/api/*` daqui fazem **proxy** para o Nest (`auth`, `users`, `admin/agendamento/*`, `admin/whatsapp/*`, etc.). O chat da página do bot usa `POST /api/admin/chatbot/search`, que repassa para `POST /admin/agendamento/chatbot/search` no backend.

**Área do paciente:** após login com usuário `role = paciente` no backend, o front envia para [`/paciente`](http://localhost:3000/paciente), que mostra apenas dados do próprio paciente (agendamentos filtrados pelo e-mail da conta). A rota antiga `/Patients` redireciona para `/paciente`.

**WhatsApp (QR com Baileys):** a biblioteca **`@whiskeysockets/baileys`**, geração de QR (`qrcode`) e sessão em `.wa_sessions` ficam no **Nest** (`src/modules/whatsapp/whatsapp.service.ts`). No painel, use a aba **WhatsApp Conexão** (usuário admin) para escanear o QR; o front apenas consome `/admin/whatsapp/connect` e `/admin/whatsapp/status` via proxy.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family from Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Em produção, configure `BACKEND_URL` no ambiente do Next com a URL HTTPS da API e no backend `FRONTEND_URL` com a origem exata do site (CORS).
