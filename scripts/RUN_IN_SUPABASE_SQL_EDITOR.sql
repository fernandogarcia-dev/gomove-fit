-- Paste and run in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/mhnkktbwglfjliurymlp/sql/new

-- === PRO subscriptions + exercise videos ===
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago', 'promo')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  pro_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.is_pro(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND (status IN ('active', 'trialing') OR (pro_until IS NOT NULL AND pro_until > now()))
  )
$$;

DO $$ BEGIN
  CREATE POLICY "Users read own subscription" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'free', 'inactive' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'inactive') ON CONFLICT (user_id) DO NOTHING;

  IF lower(NEW.email) = lower('admin@gomove.fit') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- === Referrals ===
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT substr(md5(gen_random_uuid()::text), 1, 8)
$$;

UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

DO $$ BEGIN
  ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.referral_reward_days() RETURNS INT LANGUAGE sql IMMUTABLE AS $$ SELECT 14 $$;

CREATE OR REPLACE FUNCTION public.handle_new_profile_referral()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _referrer_id UUID; _incoming_code TEXT;
BEGIN
  IF NEW.referral_code IS NULL THEN NEW.referral_code := public.generate_referral_code(); END IF;
  SELECT raw_user_meta_data->>'referral_code' INTO _incoming_code FROM auth.users WHERE id = NEW.user_id;
  IF _incoming_code IS NOT NULL THEN
    SELECT user_id INTO _referrer_id FROM public.profiles
    WHERE referral_code = _incoming_code AND user_id != NEW.user_id;
    IF _referrer_id IS NOT NULL THEN NEW.referred_by := _referrer_id; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_profile_insert_referral BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_referral();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.grant_referral_reward()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.subscriptions
    SET pro_until = GREATEST(COALESCE(pro_until, now()), now()) + (public.referral_reward_days()::text || ' days')::interval,
        provider = COALESCE(provider, 'promo')
    WHERE user_id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_profile_insert_referral_reward AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.grant_referral_reward();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- === Exercise thumbnail URLs (public/exercises/*.webp on gomove.fit) ===
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/chin-tuck.webp' WHERE name = 'Chin tuck';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/upper-trap-stretch.webp' WHERE name = 'Upper trap stretch';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/doorway-chest-stretch.webp' WHERE name = 'Doorway chest stretch';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/wall-angels.webp' WHERE name = 'Wall angels';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/band-external-rotation.webp' WHERE name = 'Band external rotation';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/cat-cow.webp' WHERE name = 'Cat-cow';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/childs-pose.webp' WHERE name = 'Child''s pose';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/bird-dog.webp' WHERE name = 'Bird dog';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/glute-bridge.webp' WHERE name = 'Glute bridge';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/figure-four-stretch.webp' WHERE name = 'Figure-four stretch';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/clamshell.webp' WHERE name = 'Clamshell';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/heel-slides.webp' WHERE name = 'Heel slides';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/straight-leg-raise.webp' WHERE name = 'Straight leg raise';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/sit-to-stand.webp' WHERE name = 'Sit-to-stand';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/march-in-place.webp' WHERE name = 'March in place';
UPDATE public.exercises SET image_url = 'https://gomove.fit/exercises/bodyweight-squat.webp' WHERE name = 'Bodyweight squat';

-- Admin account: admin@gomove.fit (rename from legacy email if it exists)
UPDATE auth.users
SET email = 'admin@gomove.fit',
    encrypted_password = extensions.crypt('$GoMove_fit&GRANA', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = lower('fernando.garcia@backlinetalent.com');

UPDATE auth.users
SET encrypted_password = extensions.crypt('$GoMove_fit&GRANA', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = lower('admin@gomove.fit');

UPDATE auth.identities
SET provider_id = 'admin@gomove.fit',
    identity_data = jsonb_set(COALESCE(identity_data, '{}'::jsonb), '{email}', '"admin@gomove.fit"')
WHERE provider = 'email'
  AND user_id IN (SELECT id FROM auth.users WHERE lower(email) = lower('admin@gomove.fit'));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('admin@gomove.fit')
ON CONFLICT (user_id, role) DO NOTHING;
