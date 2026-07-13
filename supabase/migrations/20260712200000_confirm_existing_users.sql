-- Confirm emails for existing accounts so MVP login works without manual email verification
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
