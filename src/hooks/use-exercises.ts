import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isMissingTableError, withTimeout } from "@/lib/query-utils";

const EXERCISE_COLUMNS =
  "id,name,image_url,body_region,exercise_type,difficulty,equipment,instructions,sets_reps,duration_minutes,benefits,contraindications,created_by,created_at,updated_at";

export const useExercises = () =>
  useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from("exercises").select(EXERCISE_COLUMNS).order("name"),
        10_000,
        "Exercise catalog",
      );
      if (error) throw error;
      return data.map((row) => ({ ...row, video_url: null }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
