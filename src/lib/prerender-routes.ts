import { getAllLandingSlugs } from "@/lib/seo/landing-pages";
import { PUBLIC_ROUTES } from "@/lib/seo/site";

export const PRERENDER_ROUTES = [
  ...PUBLIC_ROUTES,
  ...getAllLandingSlugs().map((slug) => `/guides/${slug}`),
] as const;
