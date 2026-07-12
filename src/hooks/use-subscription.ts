import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isMissingTableError, withTimeout } from "@/lib/query-utils";

export type SubscriptionInfo = {
  plan: "free" | "pro";
  status: string;
  proUntil: string | null;
  currentPeriodEnd: string | null;
  isPro: boolean;
};

const FREE_INFO: SubscriptionInfo = {
  plan: "free",
  status: "inactive",
  proUntil: null,
  currentPeriodEnd: null,
  isPro: false,
};

/** Reads the current user's PRO status (paid subscription or referral/promo grant). */
export const useSubscription = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<SubscriptionInfo> => {
      const { data, error } = await withTimeout(
        supabase
          .from("subscriptions")
          .select("plan, status, pro_until, current_period_end")
          .eq("user_id", user!.id)
          .maybeSingle(),
        8_000,
        "Subscription status",
      );

      if (error) {
        if (isMissingTableError(error)) return FREE_INFO;
        throw error;
      }
      if (!data) return FREE_INFO;

      const proUntilActive = data.pro_until ? new Date(data.pro_until) > new Date() : false;
      const isPro = data.status === "active" || data.status === "trialing" || proUntilActive;

      return {
        plan: isPro ? "pro" : "free",
        status: data.status,
        proUntil: data.pro_until,
        currentPeriodEnd: data.current_period_end,
        isPro,
      };
    },
    staleTime: 60_000,
    retry: 1,
  });

  return {
    ...query,
    data: query.data ?? FREE_INFO,
    isPro: query.data?.isPro ?? false,
  };
};
