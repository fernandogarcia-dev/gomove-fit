import { useEffect } from "react";
import { analyticsConfig } from "@/lib/analytics/config";

const GTM_SCRIPT_ID = "gomove-gtm-script";

export const GoogleTagManager = () => {
  const gtmId = analyticsConfig.gtmId;

  useEffect(() => {
    if (!gtmId || document.getElementById(GTM_SCRIPT_ID)) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.id = GTM_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);
  }, [gtmId]);

  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};

export default GoogleTagManager;
