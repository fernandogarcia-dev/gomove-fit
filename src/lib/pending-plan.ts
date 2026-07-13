import type { BodyRegion } from "@/lib/constants";
import type { PlanData } from "@/lib/plan-builder";

const STORAGE_KEY = "gomove:pending_plan";

type PendingPlan = {
  plan: PlanData;
  bodyRegions: BodyRegion[];
};

export type { PendingPlan };

/** Keeps a generated-but-unsaved plan across the sign-in/sign-up redirect. */
export const savePendingPlan = (pending: PendingPlan): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
};

export const loadPendingPlan = (): PendingPlan | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPlan & { bodyRegion?: BodyRegion };
    if (parsed.bodyRegions?.length) return parsed;
    if (parsed.bodyRegion) {
      return { plan: parsed.plan, bodyRegions: [parsed.bodyRegion] };
    }
    return null;
  } catch {
    return null;
  }
};

export const clearPendingPlan = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
