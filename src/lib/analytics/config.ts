export type AnalyticsConfig = {
  gtmId: string | null;
  gaMeasurementId: string | null;
  googleSiteVerification: string | null;
  googleAdsId: string | null;
  adsenseClientId: string | null;
  adsenseSlots: Record<string, string>;
};

const trim = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const analyticsConfig: AnalyticsConfig = {
  gtmId: trim(import.meta.env.VITE_GTM_ID),
  gaMeasurementId: trim(import.meta.env.VITE_GA_MEASUREMENT_ID),
  googleSiteVerification: trim(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION),
  googleAdsId: trim(import.meta.env.VITE_GOOGLE_ADS_ID),
  adsenseClientId: trim(import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT),
  adsenseSlots: {
    hero: trim(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_HERO) ?? "",
    secondary: trim(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_SECONDARY) ?? "",
    chat: trim(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_CHAT) ?? "",
  },
};

export const isAnalyticsEnabled = (): boolean =>
  Boolean(
    analyticsConfig.gtmId ||
      analyticsConfig.gaMeasurementId ||
      analyticsConfig.googleAdsId,
  );

export const isAdSenseEnabled = (): boolean => Boolean(analyticsConfig.adsenseClientId);

export const getAdSenseSlotId = (slot: string): string | null => {
  const slotId = analyticsConfig.adsenseSlots[slot]?.trim();
  return slotId || null;
};
