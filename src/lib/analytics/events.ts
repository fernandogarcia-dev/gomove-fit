export const pushToDataLayer = (payload: Record<string, unknown>): void => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

export const trackPageView = (path: string, title = document.title): void => {
  pushToDataLayer({
    event: "page_view",
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};

export type AnalyticsEvent =
  | "login"
  | "sign_up"
  | "chat_start"
  | "plan_save"
  | "cta_click";

export const trackEvent = (
  name: AnalyticsEvent | string,
  params: Record<string, unknown> = {},
): void => {
  pushToDataLayer({
    event: name,
    ...params,
  });
};

export const trackConversion = (
  conversionLabel: string,
  params: Record<string, unknown> = {},
): void => {
  pushToDataLayer({
    event: "conversion",
    send_to: conversionLabel,
    ...params,
  });
};
