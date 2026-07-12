import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import ExerciseDetailDialog from "@/components/ExerciseDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2 } from "lucide-react";
import { BODY_REGIONS, DIFFICULTIES, EXERCISE_TYPES } from "@/lib/constants";
import { resolveExerciseImageUrl } from "@/lib/exercise-images";
import { useExercises } from "@/hooks/use-exercises";
import { trackEvent } from "@/lib/analytics/events";

const Exercises = () => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const { data: exercises = [], isLoading, isError, refetch, isFetching } = useExercises();

  const openExercise = (id: string) => {
    trackEvent("exercise_view", { source: "catalog" });
    setSelectedExerciseId(id);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesSearch =
        !term ||
        exercise.name.toLowerCase().includes(term) ||
        exercise.body_region.toLowerCase().includes(term);
      const matchesRegion = region === "all" || exercise.body_region === region;
      const matchesDifficulty = difficulty === "all" || exercise.difficulty === difficulty;
      return matchesSearch && matchesRegion && matchesDifficulty;
    });
  }, [exercises, search, region, difficulty]);

  return (
    <AppShell title="Exercise catalog">
      <div className="space-y-4">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {BODY_REGIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {DIFFICULTIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading exercises...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="font-medium">Could not load exercises</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Retrying..." : "Try again"}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-medium">No exercises found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {exercises.length === 0
                ? "The catalog is empty. An admin needs to add exercises first."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((exercise) => {
              const imageUrl = resolveExerciseImageUrl(exercise.name, exercise.image_url);

              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => openExercise(exercise.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={exercise.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="font-display font-semibold">{exercise.name}</h2>
                      <Badge variant="secondary">
                        {BODY_REGIONS.find((item) => item.value === exercise.body_region)?.label ??
                          exercise.body_region}
                      </Badge>
                      <Badge variant="outline">
                        {DIFFICULTIES.find((item) => item.value === exercise.difficulty)?.label ??
                          exercise.difficulty}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {EXERCISE_TYPES.find((item) => item.value === exercise.exercise_type)?.label ??
                        exercise.exercise_type}
                      {exercise.duration_minutes ? ` · ${exercise.duration_minutes} min` : ""}
                      {exercise.sets_reps ? ` · ${exercise.sets_reps}` : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ExerciseDetailDialog
        exerciseId={selectedExerciseId}
        onOpenChange={(open) => !open && setSelectedExerciseId(null)}
      />
    </AppShell>
  );
};

export default Exercises;
