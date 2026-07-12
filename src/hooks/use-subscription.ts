import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status, pro_until, current_period_end")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
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
  });

  return {
    ...query,
    data: query.data ?? FREE_INFO,
    isPro: query.data?.isPro ?? false,
  };
};
