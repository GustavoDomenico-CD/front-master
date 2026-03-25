This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## API local (`backend-edge`)

O painel chama rotas `/api/*` no Next; estas fazem proxy para o backend Nest no repositório irmão:

- Clone/pasta: `../backend-edge` (mesmo nível que `front` sob `GitHub/`).
- Backend: copie `../backend-edge/.env.example` para `.env`, rode `npx prisma migrate dev` se necessário, depois `PORT=3001 npm run start:dev`.
- Front: copie `env.local.example` para `.env.local` e ajuste `BACKEND_URL` se a API não estiver em `http://127.0.0.1:3001`.

**Nota:** As rotas esperadas pelo front (`/admin/agendamento/*`, sessão por cookie, etc.) precisam existir no backend que você apontar. O `backend-edge` atual expõe principalmente `auth/login` e `POST /auth/register`; alinhar contratos é o próximo passo se ainda não estiver implementado.

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
