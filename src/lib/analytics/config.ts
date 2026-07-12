export type AnalyticsConfig = {
  gtmId: string | null;
  gaMeasurementId: string | null;
  googleSiteVerification: string | null;
};

const trim = (value: string | undefined): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const analyticsConfig: AnalyticsConfig = {
  gtmId: trim(import.meta.env.VITE_GTM_ID),
  gaMeasurementId: trim(import.meta.env.VITE_GA_MEASUREMENT_ID),
  googleSiteVerification: trim(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION),
};

export const isAnalyticsEnabled = (): boolean =>
  Boolean(analyticsConfig.gtmId || analyticsConfig.gaMeasurementId);
