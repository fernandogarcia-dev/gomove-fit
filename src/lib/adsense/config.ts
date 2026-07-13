export type AdPlacement =
  | "blog-hub-top"
  | "blog-hub-mid"
  | "blog-hub-feed"
  | "article-top"
  | "article-mid"
  | "article-bottom";

const env = import.meta.env;

export const ADSENSE_CLIENT_ID =
  (env.VITE_ADSENSE_CLIENT_ID as string | undefined) ?? "ca-pub-7220183715557987";

const SLOT_ENV_MAP: Record<AdPlacement, string> = {
  "blog-hub-top": "VITE_ADSENSE_SLOT_BLOG_HUB_TOP",
  "blog-hub-mid": "VITE_ADSENSE_SLOT_BLOG_HUB_MID",
  "blog-hub-feed": "VITE_ADSENSE_SLOT_BLOG_FEED",
  "article-top": "VITE_ADSENSE_SLOT_ARTICLE_TOP",
  "article-mid": "VITE_ADSENSE_SLOT_ARTICLE_MID",
  "article-bottom": "VITE_ADSENSE_SLOT_ARTICLE_BOTTOM",
};

export const getAdSlotId = (placement: AdPlacement): string | undefined => {
  const key = SLOT_ENV_MAP[placement];
  return (env as Record<string, string | undefined>)[key];
};

export const isAdSenseConfigured = (): boolean => Boolean(ADSENSE_CLIENT_ID);

export const isAdPlacementConfigured = (placement: AdPlacement): boolean =>
  isAdSenseConfigured() && Boolean(getAdSlotId(placement));
