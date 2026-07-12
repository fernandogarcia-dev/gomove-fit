import { describe, expect, it } from "vitest";
import { buildWeeklyPlan, filterExercises, getWeekStart, isPlanEmpty } from "@/lib/plan-builder";
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
  mockExercise({ id: "3", name: "March in place", body_region: "full_body", equipment: ["none"], duration_minutes: 5 }),
  mockExercise({
    id: "4",
    name: "Band rotation",
    body_region: "shoulders",
    equipment: ["band"],
    difficulty: "intermediario",
    duration_minutes: 8,
  }),
  mockExercise({
    id: "5",
    name: "Chair squat",
    body_region: "full_body",
    equipment: ["none", "chair"],
    difficulty: "intermediario",
    duration_minutes: 10,
  }),
];

describe("plan-builder", () => {
  it("matches only the selected body region", () => {
    const matched = filterExercises(catalog, {
      bodyRegion: "back",
      difficulty: "iniciante",
      equipment: ["none", "mat"],
      minutesPerDay: 20,
      daysPerWeek: [1, 3, 5],
    });

    expect(matched.map((item) => item.name)).toEqual(["Child's pose", "Cat-cow"]);
  });

  it("does not include full_body exercises for other regions", () => {
    const matched = filterExercises(catalog, {
      bodyRegion: "neck",
      difficulty: "iniciante",
      equipment: ["none"],
      minutesPerDay: 20,
      daysPerWeek: [1],
    });

    expect(matched).toHaveLength(0);
  });

  it("excludes exercises above user difficulty", () => {
    const matched = filterExercises(catalog, {
      bodyRegion: "shoulders",
      difficulty: "iniciante",
      equipment: ["band"],
      minutesPerDay: 20,
      daysPerWeek: [1],
    });

    expect(matched).toHaveLength(0);
  });

  it("matches equipment with OR logic", () => {
    const withChairOnly = [
      ...catalog,
      mockExercise({
        id: "6",
        name: "Chair stretch",
        body_region: "full_body",
        equipment: ["chair"],
        duration_minutes: 5,
      }),
    ];

    const matched = filterExercises(withChairOnly, {
      bodyRegion: "full_body",
      difficulty: "intermediario",
      equipment: ["chair"],
      minutesPerDay: 20,
      daysPerWeek: [1],
    });

    expect(matched.map((item) => item.name)).toContain("Chair squat");
    expect(matched.map((item) => item.name)).toContain("Chair stretch");

    const noMatch = filterExercises(withChairOnly, {
      bodyRegion: "full_body",
      difficulty: "intermediario",
      equipment: ["mat"],
      minutesPerDay: 20,
      daysPerWeek: [1],
    });

    expect(noMatch.map((item) => item.name)).not.toContain("Chair squat");
    expect(noMatch.map((item) => item.name)).not.toContain("Chair stretch");
  });

  it("builds a weekly schedule respecting minutes per day", () => {
    const plan = buildWeeklyPlan(catalog, {
      bodyRegion: "back",
      difficulty: "iniciante",
      equipment: ["mat"],
      minutesPerDay: 15,
      daysPerWeek: [1, 3],
    });

    expect(plan.schedule).toHaveLength(2);
    for (const day of plan.schedule) {
      const totalMinutes = day.exercises.reduce(
        (sum, exercise) => sum + (exercise.durationMinutes ?? 10),
        0,
      );
      expect(totalMinutes).toBeLessThanOrEqual(15);
      expect(day.exercises.length).toBeGreaterThan(0);
    }
  });

  it("returns empty days when catalog has no matches", () => {
    const plan = buildWeeklyPlan([], {
      bodyRegion: "neck",
      difficulty: "iniciante",
      equipment: ["none"],
      minutesPerDay: 20,
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
