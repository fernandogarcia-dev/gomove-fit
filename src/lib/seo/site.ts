export const SITE_URL = "https://gomove.fit";
export const SITE_NAME = "GoMove";
export const SITE_TAGLINE = "Personalized home workouts without a gym";
export const SITE_LOGO = `${SITE_URL}/logotipo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const DEFAULT_LOCALE = "en_US";
export const DEFAULT_REGION = "US";

export const FAVICON_LINKS = [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
] as const;

export const SEO_KEYWORDS = [
  "home workout",
  "workout at home",
  "exercises at home",
  "no gym workout",
  "apartment gym workout",
  "condo gym exercises",
  "building gym workout",
  "workout without gym membership",
  "home exercise routine",
  "no equipment workout",
  "bodyweight exercises at home",
  "small space workout",
  "resistance band workout at home",
  "dumbbell workout at home",
  "chair exercises at home",
  "pain relief exercises",
  "stretching at home",
  "mobility exercises at home",
  "beginner home workout",
  "personalized workout plan",
  "home fitness app",
  "work from home exercises",
  "senior exercises at home",
  "USA home workout app",
] as const;

export const PUBLIC_ROUTES = [
  "/",
  "/plan",
  "/exercises",
  "/pro",
  "/guides",
  "/privacy",
  "/terms",
  "/login",
] as const;
