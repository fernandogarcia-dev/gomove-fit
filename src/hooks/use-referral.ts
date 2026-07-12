import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const REFERRAL_REWARD_DAYS = 14;

export const useReferral = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["referral", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user!.id)
        .single();
      if (profileError) throw profileError;

      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", user!.id);
      if (countError) throw countError;

      return {
        referralCode: profile.referral_code,
        referredCount: count ?? 0,
        shareUrl: `https://gomove.fit/?ref=${profile.referral_code}`,
      };
    },
    staleTime: 60_000,
  });

  return query;
};
