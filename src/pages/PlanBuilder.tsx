import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";
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
import {
  buildWeeklyPlan,
  formatBodyRegions,
  formatTimeRange,
  isPlanEmpty,
  type PlanData,
} from "@/lib/plan-builder";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { withTimeout } from "@/lib/query-utils";
import { clearPendingPlan, loadPendingPlan, savePendingPlan } from "@/lib/pending-plan";

const QUESTION_STEPS = 5;
const defaultDays = [1, 3, 5];
const MINUTE_OPTIONS = [10, 15, 20, 30, 45] as const;

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
  const [searchParams] = useSearchParams();
  const editPlanId = searchParams.get("edit");
  const { toast } = useToast();
  const { data: exercises = [], isLoading: exercisesLoading, isError: exercisesError } = useExercises();

  const pendingPlan = useMemo(() => loadPendingPlan(), []);
  const pendingPrefs = pendingPlan?.plan.preferences;

  const [step, setStep] = useState(1);
  const [bodyRegions, setBodyRegions] = useState<BodyRegion[]>(
    pendingPlan?.bodyRegions ?? pendingPrefs?.bodyRegions ?? [],
  );
  const [difficulty, setDifficulty] = useState<Difficulty | null>(
    pendingPrefs?.difficulty ?? null,
  );
  const [equipment, setEquipment] = useState<Equipment[]>(
    pendingPrefs?.equipment ?? ["none"],
  );
  const [minutesMin, setMinutesMin] = useState<number>(pendingPrefs?.minutesMin ?? 15);
  const [minutesMax, setMinutesMax] = useState<number>(pendingPrefs?.minutesMax ?? 30);
  const [daysPerWeek, setDaysPerWeek] = useState<number[]>(
    pendingPrefs?.daysPerWeek ?? defaultDays,
  );
  const [plan, setPlan] = useState<PlanData | null>(pendingPlan?.plan ?? null);
  const [saving, setSaving] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);
  const autoSaveAttempted = useRef(false);

  useEffect(() => {
    if (!editPlanId || !user || editLoaded) return;

    const loadSavedPlan = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.from("saved_plans").select("*").eq("id", editPlanId).eq("user_id", user.id).single(),
          10_000,
          "Load plan for edit",
        );
        if (error) throw error;

        const planData = data.plan_data as PlanData;
        const prefs = planData.preferences;
        setBodyRegions(prefs.bodyRegions);
        setDifficulty(prefs.difficulty);
        setEquipment(prefs.equipment);
        setMinutesMin(prefs.minutesMin);
        setMinutesMax(prefs.minutesMax);
        setDaysPerWeek(prefs.daysPerWeek);
        setPlan(planData);
        setEditLoaded(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Could not load plan",
          description: error instanceof Error ? error.message : "Unexpected error",
        });
        navigate("/plans");
      }
    };

    void loadSavedPlan();
  }, [editPlanId, user, editLoaded, navigate, toast]);

  const progressValue = plan ? 100 : (step / QUESTION_STEPS) * 100;

  const toggleBodyRegion = (value: BodyRegion) => {
    setBodyRegions((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        return next;
      }
      return [...current, value];
    });
  };

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
        return bodyRegions.length > 0;
      case 2:
        return difficulty !== null;
      case 3:
        return equipment.length > 0;
      case 4:
        return minutesMin <= minutesMax;
      case 5:
        return daysPerWeek.length > 0;
      default:
        return false;
    }
  }, [step, bodyRegions, difficulty, equipment, minutesMin, minutesMax, daysPerWeek]);

  const generatePlan = useCallback(() => {
    if (!bodyRegions.length || !difficulty) return;

    trackEvent("plan_start");
    const preferences = {
      bodyRegions,
      difficulty,
      equipment,
      minutesMin,
      minutesMax,
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
  }, [bodyRegions, difficulty, equipment, minutesMin, minutesMax, daysPerWeek, exercises, toast]);

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
    if (!plan || isPlanEmpty(plan) || bodyRegions.length === 0) return;

    if (!user) {
      savePendingPlan({ plan, bodyRegions });
      navigate("/login", { state: { from: "/plan" } });
      return;
    }

    setSaving(true);
    try {
      const regionLabels = bodyRegions
        .map((value) => BODY_REGIONS.find((item) => item.value === value)?.label ?? value)
        .join(" + ");

      if (editPlanId && user) {
        const { error } = await withTimeout(
          supabase
            .from("saved_plans")
            .update({
              title: `${regionLabels} plan`,
              plan_data: plan as unknown as Json,
            })
            .eq("id", editPlanId)
            .eq("user_id", user.id),
          12_000,
          "Update plan",
        );
        if (error) throw error;
        clearPendingPlan();
        trackEvent("plan_save");
        toast({ title: "Plan updated", description: "Your weekly plan has been refreshed." });
        navigate(`/plans/${editPlanId}`);
        return;
      }

      const { data, error } = await withTimeout(
        supabase
          .from("saved_plans")
          .insert({
            user_id: user.id,
            title: `${regionLabels} plan`,
            plan_data: plan as unknown as Json,
          })
          .select("id")
          .single(),
        12_000,
        "Save plan",
      );

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
  }, [plan, bodyRegions, user, navigate, toast, editPlanId]);

  useEffect(() => {
    if (editPlanId) return;
    if (user && plan && pendingPlan && !autoSaveAttempted.current && !isPlanEmpty(plan)) {
      autoSaveAttempted.current = true;
      void handleSave();
    }
  }, [user, plan, pendingPlan, handleSave, editPlanId]);

  const restart = () => {
    clearPendingPlan();
    autoSaveAttempted.current = false;
    setPlan(null);
    setStep(1);
    setBodyRegions([]);
    setDifficulty(null);
    setEquipment(["none"]);
    setMinutesMin(15);
    setMinutesMax(30);
    setDaysPerWeek(defaultDays);
  };

  const stepLabel = plan ? "Your plan is ready" : `Step ${step} of ${QUESTION_STEPS}`;

  return (
    <AppShell title={editPlanId ? "Edit your plan" : "Build your plan"} showBack backTo={editPlanId ? `/plans/${editPlanId}` : "/"}>
      <SeoHead
        title="Build Your Free Home Workout Plan"
        description="Answer a few questions and get a personalized weekly home workout plan. No gym required. Works with apartment gyms, bands, dumbbells, or no equipment."
        path="/plan"
        keywords={[
          "build home workout plan",
          "personalized home workout",
          "free workout plan generator",
          "apartment gym plan",
          "no gym workout plan",
        ]}
      />
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
                <p className="text-sm text-muted-foreground">
                  Select every area you want to work on. You can pick more than one.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BODY_REGIONS.map((item) => {
                    const selected = bodyRegions.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleBodyRegion(item.value)}
                        className={cn(
                          "rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors",
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
                <p className="text-sm text-muted-foreground">
                  Pick a time range. Some days you may have more or less time — we&apos;ll vary your plan within this range.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Minimum (short days)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {MINUTE_OPTIONS.map((value) => (
                        <OptionButton
                          key={`min-${value}`}
                          label={`${value} min`}
                          selected={minutesMin === value}
                          onClick={() => {
                            setMinutesMin(value);
                            if (value > minutesMax) setMinutesMax(value);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Maximum (long days)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {MINUTE_OPTIONS.map((value) => (
                        <OptionButton
                          key={`max-${value}`}
                          label={`${value} min`}
                          selected={minutesMax === value}
                          onClick={() => {
                            setMinutesMax(value);
                            if (value < minutesMin) setMinutesMin(value);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Your sessions will land between{" "}
                  <span className="font-medium text-foreground">
                    {formatTimeRange(minutesMin, minutesMax)}
                  </span>{" "}
                  depending on the day.
                </p>
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
              <div>
                <h2 className="font-display text-lg font-semibold">Your weekly plan</h2>
                <p className="text-xs text-muted-foreground">
                  {formatBodyRegions(bodyRegions)} · {formatTimeRange(minutesMin, minutesMax)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const regenerated = buildWeeklyPlan(exercises, {
                      bodyRegions,
                      difficulty: difficulty!,
                      equipment,
                      minutesMin,
                      minutesMax,
                      daysPerWeek,
                    });
                    setPlan(regenerated);
                    if (isPlanEmpty(regenerated)) {
                      toast({
                        variant: "destructive",
                        title: "No exercises matched",
                        description: "Try changing your preferences.",
                      });
                    }
                  }}
                >
                  Regenerate
                </Button>
                {user ? (
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : editPlanId ? "Update plan" : "Save"}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleSave}>
                    Sign in to save
                  </Button>
                )}
              </div>
            </div>

            {plan.schedule.map((day) => (
              <div key={day.dayOfWeek} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-1 font-medium">
                  {DAYS_OF_WEEK.find((item) => item.value === day.dayOfWeek)?.label}
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">~{day.targetMinutes} min session</p>
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

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPlan(null);
                setStep(1);
              }}
            >
              Change preferences
            </Button>
            <Button variant="outline" className="w-full" onClick={restart}>
              {editPlanId ? "Reset changes" : "Start over"}
            </Button>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
};

export default PlanBuilder;
