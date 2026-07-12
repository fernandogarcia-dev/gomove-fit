import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  analyticsConfig,
  getAdSenseSlotId,
  isAdSenseEnabled,
} from "@/lib/analytics/config";
import { customAdSlots, type CustomAd } from "@/config/customAds";

const ADSENSE_SCRIPT_ID = "gomove-adsense-script";

const loadAdSenseScript = (clientId: string): void => {
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
};

type AdBannerProps = {
  slot?: string;
  className?: string;
  label?: string;
  customAd?: CustomAd;
};

const Placeholder = ({ className, label }: { className?: string; label: string }) => (
  <div
    className={cn(
      "flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground",
      className,
    )}
  >
    {label}
  </div>
);

const CustomAdBanner = ({ ad, className }: { ad: CustomAd; className?: string }) => (
  <a
    href={ad.linkUrl}
    target="_blank"
    rel="noopener noreferrer sponsored"
    className={cn("block overflow-hidden rounded-lg border border-border bg-card", className)}
  >
    <img
      src={ad.imageUrl}
      alt={ad.alt ?? "Advertisement"}
      className="h-auto w-full object-cover"
      loading="lazy"
    />
  </a>
);

const AdSenseBanner = ({
  slotId,
  className,
}: {
  slotId: string;
  className?: string;
}) => {
  const insRef = useRef<HTMLElement>(null);
  const clientId = analyticsConfig.adsenseClientId;

  useEffect(() => {
    if (!clientId) return;
    loadAdSenseScript(clientId);
  }, [clientId]);

  useEffect(() => {
    if (!insRef.current || !clientId) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or unpublished AdSense accounts can throw here.
    }
  }, [clientId, slotId]);

  if (!clientId) return null;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-muted/20 p-2", className)}>
      <ins
        ref={insRef}
        className="adsbygoogle block min-h-[90px] w-full"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

const AdBanner = ({
  slot = "hero",
  className = "",
  label = "Ad space",
  customAd,
}: AdBannerProps) => {
  const resolvedCustomAd = customAd ?? customAdSlots[slot];
  const adsenseSlotId = getAdSenseSlotId(slot);

  if (resolvedCustomAd) {
    return <CustomAdBanner ad={resolvedCustomAd} className={className} />;
  }

  if (isAdSenseEnabled() && adsenseSlotId) {
    return <AdSenseBanner slotId={adsenseSlotId} className={className} />;
  }

  return <Placeholder className={className} label={label} />;
};

export default AdBanner;
