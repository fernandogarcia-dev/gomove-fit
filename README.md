# GoMove

Web app de exercícios personalizados com IA, focado em alívio de dores e bem-estar em casa.

**Site:** [gomove.fit](https://gomove.fit)

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, storage)
- Deploy: Vercel

## Desenvolvimento local

Requisitos: Node.js 18+ e npm.

```sh
git clone https://github.com/fernandogarcia-dev/gomove-fit.git
cd gomove-fit
npm install
cp .env.example .env
# Edite .env com as credenciais do seu projeto Supabase
npm run dev
```

O app roda em `http://localhost:8080`.

## Variáveis de ambiente

| Variável | Onde usar | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel + local | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Vercel + local | Chave anon/public do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Vercel + local | ID do projeto Supabase |

Obtenha os valores em: Supabase Dashboard → Project Settings → API.

## Build

```sh
npm run build
npm run preview
```

## Deploy (Vercel)

1. Importe o repositório GitHub no Vercel
2. Framework Preset: **Vite**
3. Root Directory: `./`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Adicione as variáveis `VITE_SUPABASE_*` em Environment Variables
7. Conecte o domínio `gomove.fit` em Project Settings → Domains

## Supabase

As migrations ficam em `supabase/migrations/`. Para aplicar no seu projeto:

```sh
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run test` | Testes (Vitest) |
