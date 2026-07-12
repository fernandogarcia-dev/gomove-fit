# GoMove Roadmap

Things intentionally **not** built yet, with a recommended path for when we get to them.

## 1. Native iOS / Android app

GoMove is a Vite + React SPA today, which already works well as an installable PWA (Add to
Home Screen). The recommended path to real App Store / Play Store apps without a rewrite:

1. Wrap the existing app with **[Capacitor](https://capacitorjs.com/)** (`@capacitor/core`,
   `@capacitor/ios`, `@capacitor/android`). It packages the built `dist/` output into a native
   shell and gives access to native APIs via plugins.
2. Ship the exact same Supabase backend — Capacitor apps talk to the same REST/Realtime APIs
   as the web app, no backend changes needed.
3. Add push notifications (`@capacitor/push-notifications`) for workout reminders — likely the
   single highest-leverage feature for retention.
4. App Store: requires an Apple Developer account (US$ 99/year). Play Store: one-time US$ 25
   fee. Both accept payments from Brazil.

## 2. Wearables & fitness app integrations

Once native (step 1), sync workout data both ways:

- **iOS**: [HealthKit](https://developer.apple.com/documentation/healthkit) via the
  `@capacitor-community/health` plugin — write calories burned / active minutes when a user
  completes a session, read step count / heart rate for context.
- **Android**: [Health Connect](https://developer.android.com/health-and-fitness/guides/health-connect)
  via the same plugin family — same idea, Google's unified health data layer (replaced Google
  Fit's API for this use case).
- **Strava**: OAuth2 integration (their API is free for reasonable usage) to import/export
  activities — popular with the "share my workout" crowd.
- Store synced metrics in a new `workout_sessions` table (calories, duration, source) so the
  data survives even if a user disconnects a wearable later.

## 3. Social / virality

- The current `ShareProgressButton` uses the Web Share API (falls back to clipboard) — works
  today on mobile browsers and shares to Instagram, WhatsApp, etc. via the native share sheet.
- Nice upgrade once there's design budget: generate a shareable image (weekly progress card)
  server-side (e.g. `@vercel/og` or a Satori-based function) instead of plain text, since
  Instagram Stories specifically reward visual shares.
- The referral program (see README → "GoMove PRO / payments") already gives a concrete reason
  to invite friends (free PRO days) — once there's a mobile app, deep-link the invite flow.

## 4. Content

- Exercise videos: `exercises.video_url` is ready in the schema and gated to PRO in the UI.
  Record short (15-30s) demonstration clips per exercise, host them anywhere with a direct
  MP4 URL (Supabase Storage, Mux, Cloudflare Stream, or even a public S3/R2 bucket), and paste
  the URL into the Admin panel (`/admin`).
- Exercise images: same idea via `exercises.image_url`, already live (not PRO-gated).
