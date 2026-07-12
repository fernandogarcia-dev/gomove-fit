const STORAGE_KEY = "gomove:referral_code";

/**
 * First-touch attribution: if the current URL has a `?ref=CODE` param, remember it so it
 * survives navigation (landing page -> plan builder -> sign up). Called once on app mount.
 */
export const captureReferralFromUrl = (): void => {
  try {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, ref);
    }
  } catch {
    // ignore malformed URLs / unavailable storage
  }
};

export const getStoredReferralCode = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearStoredReferralCode = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
