-- Harden signup triggers so new user creation does not fail when optional tables
-- or referral objects are missing on partially migrated databases.

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

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT substr(md5(gen_random_uuid()::text), 1, 8)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_profile_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer_id UUID;
  _incoming_code TEXT;
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;

  SELECT raw_user_meta_data->>'referral_code' INTO _incoming_code
  FROM auth.users WHERE id = NEW.user_id;

  IF _incoming_code IS NOT NULL THEN
    SELECT user_id INTO _referrer_id
    FROM public.profiles
    WHERE referral_code = _incoming_code AND user_id != NEW.user_id;

    IF _referrer_id IS NOT NULL THEN
      NEW.referred_by := _referrer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_profile_insert_referral
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_referral();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.grant_referral_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    BEGIN
      UPDATE public.subscriptions
      SET pro_until = GREATEST(COALESCE(pro_until, now()), now()) + interval '14 days',
          provider = COALESCE(provider, 'promo')
      WHERE user_id = NEW.referred_by;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_profile_insert_referral_reward
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.grant_referral_reward();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO UPDATE
    SET display_name = EXCLUDED.display_name;

  BEGIN
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'inactive')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  IF lower(NEW.email) = lower('admin@gomove.fit') THEN
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

UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;
