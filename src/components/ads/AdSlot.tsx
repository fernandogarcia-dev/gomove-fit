import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ADSENSE_CLIENT_ID,
  getAdSlotId,
  isAdPlacementConfigured,
  type AdPlacement,
} from "@/lib/adsense/config";

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
  /** Taller slots for in-article placements */
  variant?: "banner" | "rectangle" | "in-feed";
};

const VARIANT_MIN_HEIGHT: Record<NonNullable<AdSlotProps["variant"]>, string> = {
  banner: "min-h-[90px] sm:min-h-[100px]",
  rectangle: "min-h-[250px]",
  "in-feed": "min-h-[200px] sm:min-h-[280px]",
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const AdSlot = ({ placement, className, variant = "banner" }: AdSlotProps) => {
  const pushed = useRef(false);
  const configured = isAdPlacementConfigured(placement);
  const slotId = getAdSlotId(placement);

  useEffect(() => {
    if (!configured || pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (error) {
      console.error("AdSense push failed", error);
    }
  }, [configured, placement]);

  if (!configured) {
    return (
      <aside
        aria-hidden="true"
        className={cn(
          "my-6 flex items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4",
          VARIANT_MIN_HEIGHT[variant],
          className,
        )}
      >
        <span className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          Advertisement
        </span>
      </aside>
    );
  }

  return (
    <aside className={cn("my-6 flex justify-center overflow-hidden", className)}>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};

export default AdSlot;
