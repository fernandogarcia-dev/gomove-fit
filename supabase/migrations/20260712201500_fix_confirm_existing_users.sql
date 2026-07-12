-- Confirm emails and set a known admin password for MVP testing
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  encrypted_password = extensions.crypt('GoMove@Admin2026!', extensions.gen_salt('bf'))
WHERE lower(email) = lower('fernando.garcia@backlinetalent.com');

-- Confirm any other pending accounts
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
