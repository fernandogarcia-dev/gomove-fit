import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Pencil } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import ExerciseDetailDialog from "@/components/ExerciseDetailDialog";
import ShareProgressButton from "@/components/ShareProgressButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { getWeekStart, type PlanData } from "@/lib/plan-builder";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics/events";
import { withTimeout } from "@/lib/query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PlanDetailContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const weekStart = getWeekStart();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const { data: plan, isLoading, isError, refetch } = useQuery({
    queryKey: ["saved-plan", id],
    enabled: Boolean(id && user),
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from("saved_plans").select("*").eq("id", id!).eq("user_id", user!.id).single(),
        10_000,
        "Plan detail",
      );
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const { data: tracking = [] } = useQuery({
    queryKey: ["exercise-tracking", id, weekStart],
    enabled: Boolean(id && user),
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from("exercise_tracking")
          .select("*")
          .eq("plan_id", id!)
          .eq("user_id", user!.id)
          .eq("week_start", weekStart),
        10_000,
        "Exercise tracking",
      );
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      exerciseId,
      dayOfWeek,
      completed,
    }: {
      exerciseId: string;
      dayOfWeek: number;
      completed: boolean;
    }) => {
      const existing = tracking.find(
        (item) => item.exercise_id === exerciseId && item.day_of_week === dayOfWeek,
      );

      if (completed && existing) {
        const { error } = await supabase
          .from("exercise_tracking")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }

      if (!completed && existing) {
        const { error } = await supabase.from("exercise_tracking").delete().eq("id", existing.id);
        if (error) throw error;
        return;
      }

      if (completed) {
        const { error } = await supabase.from("exercise_tracking").insert({
          user_id: user!.id,
          plan_id: id!,
          exercise_id: exerciseId,
          day_of_week: dayOfWeek,
          week_start: weekStart,
          completed_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-tracking", id, weekStart] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Could not update progress",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    },
  });

  const planData = plan?.plan_data as PlanData | undefined;

  const completedCount = useMemo(
    () => tracking.filter((item) => item.completed_at).length,
    [tracking],
  );

  const totalExercises = useMemo(
    () => planData?.schedule.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0,
    [planData],
  );

  if (isLoading) {
    return (
      <AppShell title="Plan" showBack backTo="/plans">
        <p className="text-sm text-muted-foreground">Loading plan...</p>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Plan" showBack backTo="/plans">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-medium">Could not load this plan</p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!plan || !planData) {
    return (
      <AppShell title="Plan" showBack backTo="/plans">
        <p className="text-sm text-muted-foreground">Plan not found.</p>
        <Link to="/plans" className="mt-4 inline-block">
          <Button variant="outline">Back to my plans</Button>
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={plan.title} showBack backTo="/plans">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">This week</p>
          <p className="font-display text-2xl font-bold">
            {completedCount}/{totalExercises}
          </p>
          <p className="text-sm text-muted-foreground">exercises completed</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ShareProgressButton completed={completedCount} total={totalExercises} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/plan?edit=${id}`)}
          >
            <Pencil className="h-4 w-4" />
            Edit plan
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {planData.schedule.map((day) => (
          <section key={day.dayOfWeek} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">
                {DAYS_OF_WEEK.find((item) => item.value === day.dayOfWeek)?.label}
              </h2>
              <Badge variant="secondary">{day.exercises.length} exercises</Badge>
            </div>

            {day.exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exercises scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {day.exercises.map((exercise) => {
                  const isCompleted = tracking.some(
                    (item) =>
                      item.exercise_id === exercise.exerciseId &&
                      item.day_of_week === day.dayOfWeek &&
                      item.completed_at,
                  );

                  return (
                    <li
                      key={`${day.dayOfWeek}-${exercise.exerciseId}`}
                      className="flex items-start gap-3 rounded-lg bg-muted/40 p-3"
                    >
                      <Checkbox
                        checked={isCompleted}
                        disabled={toggleMutation.isPending}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({
                            exerciseId: exercise.exerciseId,
                            dayOfWeek: day.dayOfWeek,
                            completed: checked === true,
                          })
                        }
                        className="mt-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("exercise_view", { source: "plan_detail" });
                          setSelectedExerciseId(exercise.exerciseId);
                        }}
                        className="flex min-w-0 flex-1 items-start justify-between gap-2 text-left"
                      >
                        <div className="min-w-0">
                          <p
                            className={
                              isCompleted ? "font-medium line-through opacity-60" : "font-medium"
                            }
                          >
                            {exercise.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.setsReps ?? "Follow instructions"}
                            {exercise.durationMinutes ? ` · ${exercise.durationMinutes} min` : ""}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <ExerciseDetailDialog
        exerciseId={selectedExerciseId}
        onOpenChange={(open) => !open && setSelectedExerciseId(null)}
      />
    </AppShell>
  );
};

const PlanDetail = () => (
  <ProtectedRoute>
    <PlanDetailContent />
  </ProtectedRoute>
);

export default PlanDetail;
