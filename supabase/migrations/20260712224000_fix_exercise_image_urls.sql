-- Repair exercise image URLs accidentally seeded from a local development origin.
-- Keep canonical public assets on the production www host.
UPDATE public.exercises
SET image_url = regexp_replace(
  image_url,
  '^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?',
  'https://www.gomove.fit',
  'i'
)
WHERE image_url ~* '^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?/';

UPDATE public.exercises
SET image_url = regexp_replace(
  image_url,
  '^https://gomove\.fit/',
  'https://www.gomove.fit/',
  'i'
)
WHERE image_url ~* '^https://gomove\.fit/';
