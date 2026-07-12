import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExerciseDetail = (exerciseId: string | null) =>
  useQuery({
    queryKey: ["exercise", exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId!)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
