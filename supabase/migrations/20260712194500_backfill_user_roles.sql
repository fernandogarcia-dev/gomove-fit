-- Backfill user roles for accounts created before role assignment was added
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::public.app_role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
);

-- Ensure admin email has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('fernando.garcia@backlinetalent.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove duplicate user role if admin also got user role from backfill above
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
  AND lower(u.email) = lower('fernando.garcia@backlinetalent.com')
  AND ur.role = 'user';
