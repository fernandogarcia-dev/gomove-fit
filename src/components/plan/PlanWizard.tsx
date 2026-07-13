import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

const QUESTION_STEPS = 5;
const defaultDays = [1, 3, 5];
const MINUTE_OPTIONS = [10, 15, 20, 30, 45] as const;

export type PlanWizardInitial = {
  bodyRegions?: BodyRegion[];
  difficulty?: Difficulty | null;
  equipment?: Equipment[];
  minutesMin?: number;
  minutesMax?: number;
  daysPerWeek?: number[];
  plan?: PlanData | null;
};

type PlanWizardProps = {
  exercises: Exercise[];
  exercisesLoading?: boolean;
  exercisesError?: boolean;
  initial?: PlanWizardInitial;
  onComplete: (plan: PlanData, bodyRegions: BodyRegion[]) => void;
  submitLabel?: string;
};

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

export const PlanWizard = ({
  exercises,
  exercisesLoading = false,
  exercisesError = false,
  initial,
  onComplete,
  submitLabel = "Use this plan",
}: PlanWizardProps) => {
  const { toast } = useToast();
  const prefs = initial?.plan?.preferences;

  const [step, setStep] = useState(initial?.plan && !isPlanEmpty(initial.plan) ? QUESTION_STEPS + 1 : 1);
  const [bodyRegions, setBodyRegions] = useState<BodyRegion[]>(
    initial?.bodyRegions ?? prefs?.bodyRegions ?? [],
  );
  const [difficulty, setDifficulty] = useState<Difficulty | null>(
    initial?.difficulty ?? prefs?.difficulty ?? null,
  );
  const [equipment, setEquipment] = useState<Equipment[]>(
    initial?.equipment ?? prefs?.equipment ?? ["none"],
  );
  const [minutesMin, setMinutesMin] = useState(initial?.minutesMin ?? prefs?.minutesMin ?? 15);
  const [minutesMax, setMinutesMax] = useState(initial?.minutesMax ?? prefs?.minutesMax ?? 30);
  const [daysPerWeek, setDaysPerWeek] = useState<number[]>(
    initial?.daysPerWeek ?? prefs?.daysPerWeek ?? defaultDays,
  );
  const [plan, setPlan] = useState<PlanData | null>(initial?.plan ?? null);

  const progressValue = plan ? 100 : (step / QUESTION_STEPS) * 100;

  const toggleBodyRegion = (value: BodyRegion) => {
    setBodyRegions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
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
    if (!bodyRegions.length || !difficulty) return null;

    const preferences = {
      bodyRegions,
      difficulty,
      equipment,
      minutesMin,
      minutesMax,
      daysPerWeek,
    };
    return buildWeeklyPlan(exercises, preferences);
  }, [bodyRegions, difficulty, equipment, minutesMin, minutesMax, daysPerWeek, exercises]);

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
    const generated = generatePlan();
    if (!generated) return;
    setPlan(generated);
    if (isPlanEmpty(generated)) {
      toast({
        variant: "destructive",
        title: "No exercises matched",
        description: "Try different options or browse the catalog.",
      });
    } else {
      setStep(QUESTION_STEPS + 1);
    }
  };

  const handleBack = () => {
    if (step > QUESTION_STEPS) {
      setPlan(null);
      setStep(QUESTION_STEPS);
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    if (!plan || isPlanEmpty(plan) || bodyRegions.length === 0) return;
    onComplete(plan, bodyRegions);
  };

  const restart = () => {
    setPlan(null);
    setStep(1);
    setBodyRegions([]);
    setDifficulty(null);
    setEquipment(["none"]);
    setMinutesMin(15);
    setMinutesMax(30);
    setDaysPerWeek(defaultDays);
  };

  if (step > QUESTION_STEPS && plan && !isPlanEmpty(plan)) {
    const totalSessions = plan.schedule.length;
    const totalExercises = plan.schedule.reduce((sum, day) => sum + day.exercises.length, 0);

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="font-display text-lg font-semibold text-foreground">Your plan is ready</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBodyRegions(bodyRegions)} · {formatTimeRange(minutesMin, minutesMax)} ·{" "}
            {totalSessions} session{totalSessions === 1 ? "" : "s"} · {totalExercises} exercises
          </p>
        </div>

        <div className="max-h-64 space-y-3 overflow-y-auto">
          {plan.schedule.map((day) => (
            <div key={day.dayOfWeek} className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-medium">
                {DAYS_OF_WEEK.find((item) => item.value === day.dayOfWeek)?.label}
                <span className="ml-2 text-muted-foreground">~{day.targetMinutes} min</span>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {day.exercises.map((exercise) => (
                  <li key={exercise.exerciseId}>{exercise.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            Edit answers
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            {submitLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Step {step} of {QUESTION_STEPS}</span>
          <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {step === 1 ? (
        <>
          <h3 className="font-display text-lg font-semibold">Where do you feel discomfort?</h3>
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
                    "rounded-xl border-2 px-3 py-2.5 text-sm font-medium",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card",
                  )}
                >
                  {selected ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h3 className="font-display text-lg font-semibold">What is your fitness level?</h3>
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
          <h3 className="font-display text-lg font-semibold">What do you have at home?</h3>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => {
              const selected = equipment.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleEquipment(item.value)}
                  className={cn(
                    "rounded-full border-2 px-3 py-2 text-sm font-medium",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card",
                  )}
                >
                  {selected ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <h3 className="font-display text-lg font-semibold">How long can you exercise?</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Minimum</p>
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
              <p className="text-sm font-medium">Maximum</p>
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
        </>
      ) : null}

      {step === 5 ? (
        <>
          <h3 className="font-display text-lg font-semibold">Which days work for you?</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((item) => {
              const selected = daysPerWeek.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleDay(item.value)}
                  className={cn(
                    "min-w-[3.5rem] rounded-xl border-2 px-3 py-2 text-sm font-medium",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="flex gap-2 pt-1">
        {step > 1 ? (
          <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1"
          onClick={handleNext}
          disabled={!canAdvance || (step === QUESTION_STEPS && exercisesLoading)}
        >
          {step === QUESTION_STEPS ? (exercisesLoading ? "Loading..." : "See my plan") : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {plan && isPlanEmpty(plan) ? (
        <Button type="button" variant="ghost" className="w-full" onClick={restart}>
          Start over
        </Button>
      ) : null}
    </div>
  );
};

export const summarizePlan = (plan: PlanData, bodyRegions: BodyRegion[]) => {
  const totalSessions = plan.schedule.length;
  const totalExercises = plan.schedule.reduce((sum, day) => sum + day.exercises.length, 0);
  const prefs = plan.preferences;
  return {
    regionsLabel: formatBodyRegions(bodyRegions),
    timeLabel: formatTimeRange(prefs.minutesMin, prefs.minutesMax),
    totalSessions,
    totalExercises,
  };
};
