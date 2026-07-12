import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isMissingTableError, withTimeout } from "@/lib/query-utils";

export const REFERRAL_REWARD_DAYS = 14;

export const useReferral = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data: profile, error: profileError } = await withTimeout(
        supabase.from("profiles").select("referral_code").eq("user_id", user!.id).single(),
        8_000,
        "Referral profile",
      );

      if (profileError) {
        if (isMissingTableError(profileError) || profileError.message?.includes("referral_code")) {
          return { referralCode: null, referredCount: 0, shareUrl: null };
        }
        throw profileError;
      }

      const { count, error: countError } = await withTimeout(
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("referred_by", user!.id),
        8_000,
        "Referral count",
      );

      if (countError) {
        if (isMissingTableError(countError) || countError.message?.includes("referred_by")) {
          return {
            referralCode: profile.referral_code,
            referredCount: 0,
            shareUrl: profile.referral_code
              ? `https://gomove.fit/?ref=${profile.referral_code}`
              : null,
          };
        }
        throw countError;
      }

      return {
        referralCode: profile.referral_code,
        referredCount: count ?? 0,
        shareUrl: `https://gomove.fit/?ref=${profile.referral_code}`,
      };
    },
    staleTime: 60_000,
    retry: 1,
  });
};
