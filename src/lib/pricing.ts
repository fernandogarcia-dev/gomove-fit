/**
 * GoMove PRO pricing. This is just presentation config — the source of truth for what
 * gets charged lives in Stripe (Price objects), referenced server-side via
 * STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY env vars. Change the numbers below any time;
 * update the matching Stripe Price to actually change what's charged.
 */
export const PRO_PRICING = {
  currency: "BRL",
  monthly: {
    amount: 9.9,
    label: "R$ 9,90/mês",
    interval: "month" as const,
  },
  yearly: {
    amount: 79,
    label: "R$ 79/ano",
    /** ~R$6,58/month — the usual "pay yearly, save ~33%" nudge */
    monthlyEquivalentLabel: "R$ 6,58/mês",
    interval: "year" as const,
  },
} as const;

export type BillingInterval = "monthly" | "yearly";

export const PRO_FEATURES = [
  "Demonstration video for every exercise",
  "Early access to new features",
  "Directly supports GoMove's development",
] as const;
