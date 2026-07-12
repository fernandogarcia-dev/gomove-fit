import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/query-utils";

const EXERCISE_COLUMNS =
  "id,name,image_url,body_region,exercise_type,difficulty,equipment,instructions,sets_reps,duration_minutes,benefits,contraindications,created_by,created_at,updated_at";

export const useExerciseDetail = (exerciseId: string | null) =>
  useQuery({
    queryKey: ["exercise", exerciseId],
    enabled: Boolean(exerciseId),
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from("exercises").select(EXERCISE_COLUMNS).eq("id", exerciseId!).single(),
        8_000,
        "Exercise detail",
      );
      if (error) throw error;
      return { ...data, video_url: null };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
