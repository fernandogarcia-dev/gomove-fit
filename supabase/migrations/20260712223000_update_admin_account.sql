-- Switch MVP admin account to admin@gomove.fit

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
  VALUES (NEW.id, 'free', 'inactive') ON CONFLICT (user_id) DO NOTHING;

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
