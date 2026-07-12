import { describe, expect, it } from "vitest";
import {
  buildWeeklyPlan,
  filterExercises,
  getWeekStart,
  isPlanEmpty,
  pickDayMinutes,
} from "@/lib/plan-builder";
import type { Database } from "@/integrations/supabase/types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

const mockExercise = (overrides: Partial<Exercise>): Exercise => ({
  id: overrides.id ?? crypto.randomUUID(),
  name: overrides.name ?? "Test exercise",
  body_region: overrides.body_region ?? "back",
  exercise_type: overrides.exercise_type ?? "stretch",
  difficulty: overrides.difficulty ?? "iniciante",
  equipment: overrides.equipment ?? ["none"],
  instructions: overrides.instructions ?? null,
  sets_reps: overrides.sets_reps ?? null,
  duration_minutes: overrides.duration_minutes ?? 10,
  benefits: overrides.benefits ?? null,
  contraindications: overrides.contraindications ?? null,
  image_url: null,
  video_url: null,
  created_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const catalog: Exercise[] = [
  mockExercise({ id: "1", name: "Cat-cow", body_region: "back", equipment: ["mat"], duration_minutes: 8 }),
  mockExercise({ id: "2", name: "Child's pose", body_region: "back", equipment: ["mat"], duration_minutes: 5 }),
  mockExercise({ id: "3", name: "Neck stretch", body_region: "neck", equipment: ["none"], duration_minutes: 5 }),
  mockExercise({
    id: "4",
    name: "Band rotation",
    body_region: "shoulders",
    equipment: ["band"],
    difficulty: "intermediario",
    duration_minutes: 8,
  }),
];

describe("plan-builder", () => {
  it("matches any selected body region", () => {
    const matched = filterExercises(catalog, {
      bodyRegions: ["back", "neck"],
      difficulty: "iniciante",
      equipment: ["none", "mat"],
      minutesMin: 10,
      minutesMax: 20,
      daysPerWeek: [1, 3, 5],
    });

    expect(matched.map((item) => item.name).sort()).toEqual(
      ["Cat-cow", "Child's pose", "Neck stretch"].sort(),
    );
  });

  it("excludes exercises above user difficulty", () => {
    const matched = filterExercises(catalog, {
      bodyRegions: ["shoulders"],
      difficulty: "iniciante",
      equipment: ["band"],
      minutesMin: 10,
      minutesMax: 20,
      daysPerWeek: [1],
    });

    expect(matched).toHaveLength(0);
  });

  it("varies day minutes inside the user's range", () => {
    expect(pickDayMinutes(10, 30, 0)).toBeGreaterThanOrEqual(10);
    expect(pickDayMinutes(10, 30, 0)).toBeLessThanOrEqual(30);
    expect(pickDayMinutes(15, 15, 2)).toBe(15);
  });

  it("builds a weekly schedule respecting max minutes per day", () => {
    const plan = buildWeeklyPlan(catalog, {
      bodyRegions: ["back"],
      difficulty: "iniciante",
      equipment: ["mat"],
      minutesMin: 10,
      minutesMax: 15,
      daysPerWeek: [1, 3],
    });

    expect(plan.schedule).toHaveLength(2);
    for (const day of plan.schedule) {
      const totalMinutes = day.exercises.reduce(
        (sum, exercise) => sum + (exercise.durationMinutes ?? 10),
        0,
      );
      expect(totalMinutes).toBeLessThanOrEqual(day.targetMinutes + 5);
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });

  it("returns empty days when catalog has no matches", () => {
    const plan = buildWeeklyPlan([], {
      bodyRegions: ["hips"],
      difficulty: "iniciante",
      equipment: ["none"],
      minutesMin: 10,
      minutesMax: 20,
      daysPerWeek: [1, 2],
    });

    expect(isPlanEmpty(plan)).toBe(true);
  });

  it("computes week start in local timezone", () => {
    const sunday = new Date(2026, 6, 12, 22, 0, 0);
    expect(getWeekStart(sunday)).toBe("2026-07-06");

    const monday = new Date(2026, 6, 13, 8, 0, 0);
    expect(getWeekStart(monday)).toBe("2026-07-13");
  });
});
