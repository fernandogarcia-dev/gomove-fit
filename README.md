# GoMove

Web app de exercícios personalizados em casa, focado em alívio de dores e bem-estar.

**Site:** [gomove.fit](https://gomove.fit)

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, storage)
- Deploy: Vercel

## MVP features

- Questionnaire-based weekly plan builder
- Exercise catalog with filters
- Saved plans for authenticated users
- Weekly exercise completion tracking
- Admin panel for exercise CRUD

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
| `VITE_SUPABASE_ANON_KEY` | Vercel + local | Chave anon/public do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Vercel + local | ID do projeto Supabase |
| `VITE_GTM_ID` | Opcional | Google Tag Manager |
| `VITE_GA_MEASUREMENT_ID` | Opcional | GA4 (via GTM) |
| `VITE_GOOGLE_SITE_VERIFICATION` | Opcional | Search Console |

Obtenha os valores em: Supabase Dashboard → Project Settings → API.

### Setup inicial (admin + seed)

1. Push das migrations (aplica catálogo inicial de exercícios, roles e backfill):

```sh
npx supabase db push
```

2. **Desative confirmação de email** no Supabase Dashboard (recomendado para MVP):
   Authentication → Providers → Email → **Confirm email OFF**

3. Crie ou atualize o usuário admin localmente (requer service role key):

```sh
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
export ADMIN_EMAIL=fernando.garcia@backlinetalent.com
export ADMIN_PASSWORD=your_secure_password
npm run setup:admin
npm run setup:seed
```

O email `fernando.garcia@backlinetalent.com` também recebe role `admin` automaticamente ao se cadastrar via `/login`.

## Build

```sh
npm run build
npm run preview
```

## Deploy (Vercel)

### Branches e ambientes

| Branch | Ambiente | URL |
|---|---|---|
| `main` | **Produção** | [gomove.fit](https://gomove.fit) |
| `preview` | **Preview** | URL automática do Vercel (`*.vercel.app`) |

Fluxo de trabalho:

1. Desenvolva em branches de feature (`feature/nome-da-feature`)
2. Abra PR para `preview` e valide no ambiente de preview do Vercel
3. Quando estiver pronto, abra PR de `preview` → `main` para publicar em produção

## Supabase

As migrations ficam em `supabase/migrations/`. Com a integração GitHub do Supabase ativa, migrations são aplicadas automaticamente ao fazer merge/push na branch `main`.

Para aplicar manualmente (CLI local):

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
| `node scripts/setup-admin.mjs` | Cria/atualiza usuário admin |
