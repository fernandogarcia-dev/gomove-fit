import type { Database } from "@/integrations/supabase/types";
import type { BodyRegion, Difficulty, Equipment } from "@/lib/constants";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

export type PlanPreferences = {
  bodyRegion: BodyRegion;
  difficulty: Difficulty;
  equipment: Equipment[];
  minutesPerDay: number;
  daysPerWeek: number[];
};

export type PlanExercise = {
  exerciseId: string;
  name: string;
  setsReps: string | null;
  durationMinutes: number | null;
  instructions: string | null;
  contraindications: string | null;
};

export type PlanDay = {
  dayOfWeek: number;
  exercises: PlanExercise[];
};

export type PlanData = {
  preferences: PlanPreferences;
  schedule: PlanDay[];
  generatedAt: string;
};

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  iniciante: 1,
  intermediario: 2,
  avancado: 3,
};

const matchesBodyRegion = (exercise: Exercise, region: BodyRegion): boolean =>
  exercise.body_region === region;

const matchesDifficulty = (exercise: Exercise, difficulty: Difficulty): boolean =>
  DIFFICULTY_RANK[exercise.difficulty as Difficulty] <= DIFFICULTY_RANK[difficulty];

const matchesEquipment = (exercise: Exercise, available: Equipment[]): boolean => {
  const required = exercise.equipment ?? [];
  if (required.length === 0 || required.every((item) => item === "none")) {
    return true;
  }
  return required.some((item) => available.includes(item as Equipment));
};

export const filterExercises = (
  exercises: Exercise[],
  preferences: PlanPreferences,
): Exercise[] =>
  exercises
    .filter(
      (exercise) =>
        matchesBodyRegion(exercise, preferences.bodyRegion) &&
        matchesDifficulty(exercise, preferences.difficulty) &&
        matchesEquipment(exercise, preferences.equipment),
    )
    .sort((a, b) => (a.duration_minutes ?? 10) - (b.duration_minutes ?? 10));

export const isPlanEmpty = (plan: PlanData): boolean =>
  plan.schedule.every((day) => day.exercises.length === 0);

export const buildWeeklyPlan = (
  exercises: Exercise[],
  preferences: PlanPreferences,
): PlanData => {
  const matched = filterExercises(exercises, preferences);
  const days = [...preferences.daysPerWeek].sort((a, b) => a - b);
  const schedule: PlanDay[] = days.map((dayOfWeek) => ({
    dayOfWeek,
    exercises: [],
  }));

  if (matched.length === 0 || schedule.length === 0) {
    return {
      preferences,
      schedule,
      generatedAt: new Date().toISOString(),
    };
  }

  let exerciseIndex = 0;
  for (const day of schedule) {
    let minutesUsed = 0;
    const maxAttempts = matched.length * schedule.length;
    let attempts = 0;

    while (
      minutesUsed < preferences.minutesPerDay &&
      attempts < maxAttempts &&
      day.exercises.length < 4
    ) {
      const exercise = matched[exerciseIndex % matched.length];
      exerciseIndex += 1;
      attempts += 1;

      const duration = exercise.duration_minutes ?? 10;
      if (minutesUsed + duration > preferences.minutesPerDay && day.exercises.length > 0) {
        continue;
      }

      const alreadyAdded = day.exercises.some((item) => item.exerciseId === exercise.id);
      if (alreadyAdded) continue;

      day.exercises.push({
        exerciseId: exercise.id,
        name: exercise.name,
        setsReps: exercise.sets_reps,
        durationMinutes: exercise.duration_minutes,
        instructions: exercise.instructions,
        contraindications: exercise.contraindications,
      });
      minutesUsed += duration;
    }
  }

  return {
    preferences,
    schedule,
    generatedAt: new Date().toISOString(),
  };
};

export const getWeekStart = (date = new Date()): string => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
};
