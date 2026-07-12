-- Referral program: inviting a friend who signs up grants the inviter free PRO days.
-- No cash rewards, no pyramid mechanics — just "share GoMove, unlock PRO for a while".

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Referral codes are lowercase hex (md5 of random bytes) — short, unique enough, and
-- always URL-safe (no +, /, or = characters to worry about in query strings).
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT substr(md5(gen_random_uuid()::text), 1, 8)
$$;

-- Backfill codes for existing profiles.
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET NOT NULL,
  ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);

-- Days of free PRO granted to the inviter for each friend who creates an account.
CREATE OR REPLACE FUNCTION public.referral_reward_days()
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 14
$$;

-- Auto-assign a referral code to every new profile, and resolve the referral code passed
-- at signup (via auth metadata) into a `referred_by` user id.
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

CREATE TRIGGER on_profile_insert_referral
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_referral();

-- Once a referral is attributed, grant the inviter extra free PRO days (stacks with existing grants).
CREATE OR REPLACE FUNCTION public.grant_referral_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

CREATE TRIGGER on_profile_insert_referral_reward
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_referral_reward();

-- Note: referral_code is covered by the existing "Public profiles readable" SELECT policy
-- on public.profiles, so client code can resolve invite links without extra grants.
