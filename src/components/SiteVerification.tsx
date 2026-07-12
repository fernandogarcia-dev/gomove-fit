import { useEffect } from "react";
import { analyticsConfig } from "@/lib/analytics/config";

const META_NAME = "google-site-verification";

const SiteVerification = () => {
  const verificationCode = analyticsConfig.googleSiteVerification;

  useEffect(() => {
    if (!verificationCode) return;

    let meta = document.querySelector(`meta[name="${META_NAME}"]`);

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", META_NAME);
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", verificationCode);
  }, [verificationCode]);

  return null;
};

export default SiteVerification;
