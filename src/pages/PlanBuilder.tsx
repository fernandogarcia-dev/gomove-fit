import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import AppShell from "@/components/AppShell";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useExercises } from "@/hooks/use-exercises";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics/events";
import {
  BODY_REGIONS,
  DAYS_OF_WEEK,
  DIFFICULTIES,
  EQUIPMENT_OPTIONS,
  type BodyRegion,
  type Difficulty,
  type Equipment,
} from "@/lib/constants";
import { buildWeeklyPlan, isPlanEmpty, type PlanData } from "@/lib/plan-builder";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { clearPendingPlan, loadPendingPlan, savePendingPlan } from "@/lib/pending-plan";

const QUESTION_STEPS = 5;
const defaultDays = [1, 3, 5];

type OptionProps = {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
};

const OptionButton = ({ label, description, selected, onClick }: OptionProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full rounded-xl border-2 px-4 py-4 text-left transition-colors",
      selected
        ? "border-primary bg-primary/10 text-foreground"
        : "border-border bg-card hover:border-primary/40",
    )}
  >
    <span className="font-medium">{label}</span>
    {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
  </button>
);

const PlanBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: exercises = [], isLoading: exercisesLoading, isError: exercisesError } = useExercises();

  const pendingPlan = useMemo(() => loadPendingPlan(), []);

  const [step, setStep] = useState(1);
  const [bodyRegion, setBodyRegion] = useState<BodyRegion | null>(pendingPlan?.bodyRegion ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>(["none"]);
  const [minutesPerDay, setMinutesPerDay] = useState<number | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<number[]>(defaultDays);
  const [plan, setPlan] = useState<PlanData | null>(pendingPlan?.plan ?? null);
  const [saving, setSaving] = useState(false);
  const autoSaveAttempted = useRef(false);

  const progressValue = plan ? 100 : (step / QUESTION_STEPS) * 100;

  const toggleEquipment = (value: Equipment) => {
    setEquipment((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        return next.length > 0 ? next : current;
      }
      return [...current, value];
    });
  };

  const toggleDay = (value: number) => {
    setDaysPerWeek((current) => {
      if (current.includes(value)) {
        const next = current.filter((day) => day !== value);
        return next.length > 0 ? next : current;
      }
      return [...current, value].sort((a, b) => a - b);
    });
  };

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return bodyRegion !== null;
      case 2:
        return difficulty !== null;
      case 3:
        return equipment.length > 0;
      case 4:
        return minutesPerDay !== null;
      case 5:
        return daysPerWeek.length > 0;
      default:
        return false;
    }
  }, [step, bodyRegion, difficulty, equipment, minutesPerDay, daysPerWeek]);

  const generatePlan = useCallback(() => {
    if (!bodyRegion || !difficulty || minutesPerDay === null) return;

    trackEvent("plan_start");
    const preferences = {
      bodyRegion,
      difficulty,
      equipment,
      minutesPerDay,
      daysPerWeek,
    };
    const generated = buildWeeklyPlan(exercises, preferences);
    setPlan(generated);

    if (isPlanEmpty(generated)) {
      toast({
        variant: "destructive",
        title: "No exercises matched",
        description: "Try different options or browse the catalog.",
      });
    }
  }, [bodyRegion, difficulty, equipment, minutesPerDay, daysPerWeek, exercises, toast]);

  const handleNext = () => {
    if (step < QUESTION_STEPS) {
      setStep(step + 1);
      return;
    }
    if (exercisesLoading) {
      toast({ title: "Loading exercises...", description: "Please wait a moment." });
      return;
    }
    if (exercisesError) {
      toast({
        variant: "destructive",
        title: "Could not load exercises",
        description: "Check your connection and try again.",
      });
      return;
    }
    generatePlan();
  };

  const handleBack = () => {
    if (plan) {
      setPlan(null);
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleSave = useCallback(async () => {
    if (!plan || isPlanEmpty(plan) || !bodyRegion) return;

    if (!user) {
      // Keep the generated plan so it survives the sign-in/sign-up round trip.
      savePendingPlan({ plan, bodyRegion });
      navigate("/login", { state: { from: "/plan" } });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("saved_plans")
        .insert({
          user_id: user.id,
          title: `${BODY_REGIONS.find((item) => item.value === bodyRegion)?.label ?? "Custom"} plan`,
          plan_data: plan as unknown as Json,
        })
        .select("id")
        .single();

      if (error) throw error;
      clearPendingPlan();
      trackEvent("plan_save");
      toast({ title: "Plan saved", description: "Your weekly plan is ready to follow." });
      navigate(`/plans/${data.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not save plan",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setSaving(false);
    }
  }, [plan, bodyRegion, user, navigate, toast]);

  // If the user just signed in/up after building a plan, save it automatically —
  // no need to click "Save" again and lose momentum.
  useEffect(() => {
    if (user && pendingPlan && !autoSaveAttempted.current) {
      autoSaveAttempted.current = true;
      handleSave();
    }
  }, [user, pendingPlan, handleSave]);

  const restart = () => {
    clearPendingPlan();
    setPlan(null);
    setStep(1);
    setBodyRegion(null);
    setDifficulty(null);
    setEquipment(["none"]);
    setMinutesPerDay(null);
    setDaysPerWeek(defaultDays);
  };

  const stepLabel = plan
    ? "Your plan is ready"
    : `Step ${step} of ${QUESTION_STEPS}`;

  return (
    <AppShell title="Build your plan" showBack backTo="/">
      <MedicalDisclaimer compact />

      <div className="mt-4 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{stepLabel}</span>
            {!plan ? <span className="text-muted-foreground">{Math.round(progressValue)}%</span> : null}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {!plan ? (
          <section className="space-y-4">
            {step === 1 ? (
              <>
                <h2 className="font-display text-xl font-semibold">Where do you feel discomfort?</h2>
                <p className="text-sm text-muted-foreground">Pick the area you want to focus on.</p>
                <div className="grid gap-2">
                  {BODY_REGIONS.map((item) => (
                    <OptionButton
                      key={item.value}
                      label={item.label}
                      selected={bodyRegion === item.value}
                      onClick={() => setBodyRegion(item.value)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="font-display text-xl font-semibold">What is your fitness level?</h2>
                <p className="text-sm text-muted-foreground">Choose the option that fits you best today.</p>
                <div className="grid gap-2">
                  {DIFFICULTIES.map((item) => (
                    <OptionButton
                      key={item.value}
                      label={item.label}
                      selected={difficulty === item.value}
                      onClick={() => setDifficulty(item.value)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h2 className="font-display text-xl font-semibold">What do you have at home?</h2>
                <p className="text-sm text-muted-foreground">Tap everything available. Select at least one.</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((item) => {
                    const selected = equipment.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleEquipment(item.value)}
                        className={cn(
                          "rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground",
                        )}
                      >
                        {selected ? <Check className="mr-1 inline h-4 w-4" /> : null}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h2 className="font-display text-xl font-semibold">How long can you exercise?</h2>
                <p className="text-sm text-muted-foreground">Minutes per session.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[10, 15, 20, 30, 45].map((value) => (
                    <OptionButton
                      key={value}
                      label={`${value} min`}
                      selected={minutesPerDay === value}
                      onClick={() => setMinutesPerDay(value)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <h2 className="font-display text-xl font-semibold">Which days work for you?</h2>
                <p className="text-sm text-muted-foreground">Select at least one day.</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((item) => {
                    const selected = daysPerWeek.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleDay(item.value)}
                        className={cn(
                          "min-w-[4.5rem] rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            <div className="flex gap-3 pt-2">
              {step > 1 ? (
                <Button variant="outline" className="flex-1" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : null}
              <Button
                className="flex-1"
                onClick={handleNext}
                disabled={!canAdvance || (step === QUESTION_STEPS && exercisesLoading)}
              >
                {step === QUESTION_STEPS
                  ? exercisesLoading
                    ? "Loading..."
                    : "See my plan"
                  : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : null}

        {plan && isPlanEmpty(plan) ? (
          <section className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="font-medium">No exercises matched your answers</p>
            <p className="mt-1 text-sm text-muted-foreground">Try again with different options.</p>
            <Button className="mt-4" variant="outline" onClick={restart}>
              Start over
            </Button>
          </section>
        ) : null}

        {plan && !isPlanEmpty(plan) ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Your weekly plan</h2>
              {user ? (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleSave}>
                  Sign in to save
                </Button>
              )}
            </div>

            {plan.schedule.map((day) => (
              <div key={day.dayOfWeek} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-medium">
                  {DAYS_OF_WEEK.find((item) => item.value === day.dayOfWeek)?.label}
                </h3>
                <ul className="space-y-3">
                  {day.exercises.map((exercise) => (
                    <li key={exercise.exerciseId} className="rounded-lg bg-muted/40 p-3">
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.setsReps ?? "Follow instructions"}
                        {exercise.durationMinutes ? ` · ${exercise.durationMinutes} min` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={restart}>
              Start over
            </Button>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
};

export default PlanBuilder;
