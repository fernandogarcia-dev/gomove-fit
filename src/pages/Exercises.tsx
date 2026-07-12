import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BODY_REGIONS, DIFFICULTIES, EXERCISE_TYPES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

const Exercises = () => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

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
          <p className="text-sm text-muted-foreground">Loading exercises...</p>
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
            {filtered.map((exercise) => (
              <article key={exercise.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
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
                <p className="text-sm text-muted-foreground">
                  {EXERCISE_TYPES.find((item) => item.value === exercise.exercise_type)?.label ??
                    exercise.exercise_type}
                  {exercise.duration_minutes ? ` · ${exercise.duration_minutes} min` : ""}
                  {exercise.sets_reps ? ` · ${exercise.sets_reps}` : ""}
                </p>
                {exercise.instructions ? (
                  <p className="mt-2 text-sm leading-relaxed">{exercise.instructions}</p>
                ) : null}
                {exercise.benefits ? (
                  <p className="mt-2 text-sm text-primary">Benefits: {exercise.benefits}</p>
                ) : null}
                {exercise.contraindications ? (
                  <p className="mt-2 text-xs text-amber-700">
                    Caution: {exercise.contraindications}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Exercises;
