import { Dumbbell, Loader2, PlayCircle } from "lucide-react";
import ProComingSoon from "@/components/ProComingSoon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useExerciseDetail } from "@/hooks/use-exercise-detail";
import { useSubscription } from "@/hooks/use-subscription";
import { BODY_REGIONS, DIFFICULTIES, EXERCISE_TYPES } from "@/lib/constants";
import { resolveExerciseImageUrl } from "@/lib/exercise-images";

type ExerciseDetailDialogProps = {
  exerciseId: string | null;
  onOpenChange: (open: boolean) => void;
};

const ExerciseDetailDialog = ({ exerciseId, onOpenChange }: ExerciseDetailDialogProps) => {
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId);
  const { isPro } = useSubscription();

  return (
    <Dialog open={Boolean(exerciseId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {isLoading || !exercise ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading exercise...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{exercise.name}</DialogTitle>
            </DialogHeader>

            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {resolveExerciseImageUrl(exercise.name, exercise.image_url) ? (
                <img
                  src={resolveExerciseImageUrl(exercise.name, exercise.image_url)!}
                  alt={exercise.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {BODY_REGIONS.find((item) => item.value === exercise.body_region)?.label ??
                  exercise.body_region}
              </Badge>
              <Badge variant="outline">
                {DIFFICULTIES.find((item) => item.value === exercise.difficulty)?.label ??
                  exercise.difficulty}
              </Badge>
              <Badge variant="outline">
                {EXERCISE_TYPES.find((item) => item.value === exercise.exercise_type)?.label ??
                  exercise.exercise_type}
              </Badge>
            </div>

            <p className="text-sm font-medium text-foreground">
              {exercise.sets_reps ?? "Follow the instructions below"}
              {exercise.duration_minutes ? ` · ~${exercise.duration_minutes} min` : ""}
            </p>

            {exercise.instructions ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">How to do it</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{exercise.instructions}</p>
              </div>
            ) : null}

            {exercise.benefits ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Benefits</h3>
                <p className="text-sm leading-relaxed text-primary">{exercise.benefits}</p>
              </div>
            ) : null}

            {exercise.contraindications ? (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Caution</h3>
                <p className="text-sm leading-relaxed text-amber-700">{exercise.contraindications}</p>
              </div>
            ) : null}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Demonstration video</h3>
              {isPro ? (
                exercise.video_url ? (
                  <video
                    src={exercise.video_url}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    <PlayCircle className="h-5 w-5" />
                    Video coming soon for this exercise.
                  </div>
                )
              ) : (
                <ProComingSoon variant="inline" />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
