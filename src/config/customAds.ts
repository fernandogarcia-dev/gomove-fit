export type CustomAd = {
  imageUrl: string;
  linkUrl: string;
  alt?: string;
};

/**
 * Configure direct-sold ads here without changing component code.
 * Example:
 * hero: { imageUrl: "/ads/partner.webp", linkUrl: "https://partner.com", alt: "Partner" }
 */
export const customAdSlots: Partial<Record<string, CustomAd>> = {};
