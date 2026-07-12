import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAnalyticsEnabled } from "@/lib/analytics/config";
import { trackPageView } from "@/lib/analytics/events";

const AnalyticsRouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path);
  }, [location]);

  return null;
};

export default AnalyticsRouteTracker;
