import { useEffect } from "react";
import { ADSENSE_CLIENT_ID, isAdSenseConfigured } from "@/lib/adsense/config";

const SCRIPT_ID = "gomove-adsense";

const AdSenseScript = () => {
  useEffect(() => {
    if (!isAdSenseConfigured() || document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
};

export default AdSenseScript;
