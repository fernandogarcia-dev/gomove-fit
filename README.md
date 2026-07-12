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
- Exercise catalog with filters, and a detail view (image, how-to description, video)
- Saved plans for authenticated users, with the plan preserved across the sign-up flow
- Weekly exercise completion tracking, with a one-tap "share progress" action
- **GoMove PRO**: optional paid subscription (Stripe) that unlocks exercise demonstration
  videos. Everything else in the app stays free — see "GoMove PRO / payments" below.
- Referral program: inviting a friend grants free PRO days, no purchase required
- Admin panel for exercise CRUD (name, instructions, benefits, image, video, etc.)

See [`ROADMAP.md`](./ROADMAP.md) for what's planned next (native iOS/Android app, wearable
integrations, etc.).

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
export ADMIN_EMAIL=admin@gomove.fit
export ADMIN_PASSWORD=your_secure_password
npm run setup:admin
npm run setup:seed
```

O email `admin@gomove.fit` também recebe role `admin` automaticamente ao se cadastrar via `/login`.

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

## GoMove PRO / payments

GoMove PRO is a small, optional subscription (default: R$ 9,90/month or R$ 79/year — see
`src/lib/pricing.ts`) that unlocks exercise demonstration videos. The plan builder, exercise
catalog, and progress tracking stay free for everyone, forever. Payments are processed by
**Stripe** and handled by three serverless functions in `api/`:

| Function | Purpose |
|---|---|
| `api/create-checkout-session.ts` | Starts a Stripe Checkout session for the signed-in user |
| `api/create-portal-session.ts` | Opens the Stripe customer portal so users can manage/cancel |
| `api/stripe-webhook.ts` | Receives Stripe events and updates `public.subscriptions` |

### One-time setup

1. **Create a Stripe account**: [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   (free, no monthly fees — Stripe only takes a % per transaction). Since you have a CNPJ,
   register as a business account so you can accept international cards in multiple
   currencies, not just BRL.
2. **Create two recurring Prices** in Stripe Dashboard → Product catalog → Add product
   ("GoMove PRO"): one monthly, one yearly, matching the amounts in `src/lib/pricing.ts` (or
   your own — the numbers there are just UI copy, the Price objects are what actually charge).
   Copy each Price ID (`price_...`).
3. **Get your API keys**: Dashboard → Developers → API keys. Copy the **Secret key**
   (`sk_live_...` in production, `sk_test_...` while testing).
4. **Create the webhook**: Dashboard → Developers → Webhooks → Add endpoint.
   - URL: `https://gomove.fit/api/stripe-webhook`
   - Events to send: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`).
5. **Set environment variables on Vercel** (Project Settings → Environment Variables,
   Production + Preview): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`,
   `STRIPE_PRICE_YEARLY`, and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Settings → API —
   this key must stay server-side only, it bypasses Row Level Security).
6. Deploy. Test with a [Stripe test card](https://docs.stripe.com/testing) (`4242 4242 4242 4242`)
   before switching to live keys.

### Where the money lands

Stripe deposits net proceeds (after their fee) to your linked bank account on Stripe's normal
payout schedule (Dashboard → Settings → Payouts to configure the schedule and bank account).

### How PRO access is tracked

`public.subscriptions` (one row per user) is the source of truth, checked via the
`public.is_pro(user_id)` SQL function and the `useSubscription()` hook. A user counts as PRO
if either:
- their Stripe subscription `status` is `active`/`trialing` (kept in sync by the webhook), or
- `pro_until` is in the future (used for referral rewards / manual comps — see the
  `subscriptions.provider = 'promo'` rows created by the referral trigger in
  `supabase/migrations/20260712211000_add_referrals.sql`).

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
