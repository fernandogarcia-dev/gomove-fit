-- GoMove PRO: exercise media (video) + subscription/plan-tier tracking.
-- Monetization model: the full app (plan builder, exercise catalog, tracking) stays free forever.
-- PRO unlocks nice-to-have extras (exercise demonstration videos, and future perks) via a paid
-- subscription. Free users lose nothing they already have — this only adds an optional upgrade.

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.exercises.video_url IS 'Demonstration video for the exercise. Playback is gated to PRO subscribers in the app.';

-- Subscriptions: one row per user, tracks both paid plans and PRO time earned for free
-- (e.g. via the referral program). Written only by trusted server code (service role key
-- from the Stripe webhook or the referral trigger below) — never directly by clients.
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago', 'promo')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  -- Covers PRO access granted without an active paid subscription (referral rewards, trials, comps).
  pro_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- True if the user currently has PRO access, whether via an active/trialing paid
-- subscription or via a temporary pro_until grant (referrals, promos).
CREATE OR REPLACE FUNCTION public.is_pro(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND (
        status IN ('active', 'trialing')
        OR (pro_until IS NOT NULL AND pro_until > now())
      )
  )
$$;

-- Users can see their own plan/status; all writes go through service-role server code.
CREATE POLICY "Users read own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Give every existing user a baseline free subscription row.
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'free', 'inactive' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Extend the signup trigger to also create the free subscription row automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'inactive')
  ON CONFLICT (user_id) DO NOTHING;

  IF lower(NEW.email) = lower('fernando.garcia@backlinetalent.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
