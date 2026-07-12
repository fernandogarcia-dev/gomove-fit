import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Save } from "lucide-react";
import AppShell from "@/components/AppShell";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
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
import { useQuery } from "@tanstack/react-query";

const defaultDays = [1, 3, 5];

const PlanBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bodyRegion, setBodyRegion] = useState<BodyRegion>("back");
  const [difficulty, setDifficulty] = useState<Difficulty>("iniciante");
  const [equipment, setEquipment] = useState<Equipment[]>(["none", "mat"]);
  const [minutesPerDay, setMinutesPerDay] = useState(20);
  const [daysPerWeek, setDaysPerWeek] = useState<number[]>(defaultDays);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const preferences = useMemo(
    () => ({
      bodyRegion,
      difficulty,
      equipment,
      minutesPerDay,
      daysPerWeek,
    }),
    [bodyRegion, difficulty, equipment, minutesPerDay, daysPerWeek],
  );

  useEffect(() => {
    setPlan(null);
  }, [bodyRegion, difficulty, equipment, minutesPerDay, daysPerWeek]);

  const toggleEquipment = (value: Equipment, checked: boolean) => {
    setEquipment((current) => {
      if (checked) return [...new Set([...current, value])];
      const next = current.filter((item) => item !== value);
      return next.length > 0 ? next : ["none"];
    });
  };

  const toggleDay = (value: number, checked: boolean) => {
    setDaysPerWeek((current) => {
      if (checked) return [...new Set([...current, value])].sort((a, b) => a - b);
      const next = current.filter((day) => day !== value);
      return next.length > 0 ? next : current;
    });
  };

  const handleGenerate = () => {
    trackEvent("plan_start");
    const generated = buildWeeklyPlan(exercises, preferences);
    setPlan(generated);

    if (isPlanEmpty(generated)) {
      toast({
        variant: "destructive",
        title: "No exercises matched",
        description: "Try another body region, difficulty, or equipment selection.",
      });
    }
  };

  const handleSave = async () => {
    if (!plan || isPlanEmpty(plan)) {
      toast({
        variant: "destructive",
        title: "Cannot save empty plan",
        description: "Generate a plan with at least one exercise first.",
      });
      return;
    }

    if (!user) {
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
  };

  const planHasExercises = plan && !isPlanEmpty(plan);

  return (
    <AppShell title="Build your plan" showBack backTo="/">
      <MedicalDisclaimer compact />

      <div className="mt-4 space-y-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="space-y-2">
            <Label>Body region</Label>
            <Select value={bodyRegion} onValueChange={(value) => setBodyRegion(value as BodyRegion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BODY_REGIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available equipment</Label>
            <p className="text-xs text-muted-foreground">
              Select everything you have at home. Exercises match if you have any required item.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label key={item.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={equipment.includes(item.value)}
                    onCheckedChange={(checked) =>
                      toggleEquipment(item.value, checked === true)
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Minutes per session</Label>
            <Select
              value={String(minutesPerDay)}
              onValueChange={(value) => setMinutesPerDay(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 30, 45].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Training days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((item) => (
                <label
                  key={item.value}
                  className="flex min-w-[4.5rem] items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={daysPerWeek.includes(item.value)}
                    onCheckedChange={(checked) => toggleDay(item.value, checked === true)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? "Loading exercises..." : "Generate plan"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {plan && isPlanEmpty(plan) ? (
          <section className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="font-medium">No exercises matched your preferences</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust your selections and try again, or browse the catalog.
            </p>
            <Link to="/exercises" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Browse exercises
              </Button>
            </Link>
          </section>
        ) : null}

        {planHasExercises ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Your weekly plan</h2>
              {user ? (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save plan"}
                </Button>
              ) : (
                <Link to="/login" state={{ from: "/plan" }}>
                  <Button size="sm" variant="outline">
                    Sign in to save
                  </Button>
                </Link>
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
                      {exercise.contraindications ? (
                        <p className="mt-1 text-xs text-amber-700">
                          Caution: {exercise.contraindications}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </AppShell>
  );
};

export default PlanBuilder;
