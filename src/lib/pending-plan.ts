import type { BodyRegion } from "@/lib/constants";
import type { PlanData } from "@/lib/plan-builder";

const STORAGE_KEY = "gomove:pending_plan";

type PendingPlan = {
  plan: PlanData;
  bodyRegion: BodyRegion;
};

/**
 * Keeps a generated-but-unsaved plan around across the sign-in/sign-up redirect,
 * so users never have to redo the questionnaire just to create an account.
 */
export const savePendingPlan = (pending: PendingPlan): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // sessionStorage may be unavailable (private mode) — safe to ignore, worst case user redoes the flow
  }
};

export const loadPendingPlan = (): PendingPlan | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingPlan;
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
