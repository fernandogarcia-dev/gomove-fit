export const BODY_REGIONS = [
  { value: "neck", label: "Neck" },
  { value: "shoulders", label: "Shoulders" },
  { value: "upper_back", label: "Upper back" },
  { value: "lower_back", label: "Lower back" },
  { value: "chest", label: "Chest" },
  { value: "elbows", label: "Elbows" },
  { value: "wrists_hands", label: "Wrists & hands" },
  { value: "core", label: "Core / abs" },
  { value: "hips", label: "Hips" },
  { value: "glutes", label: "Glutes" },
  { value: "thighs", label: "Thighs" },
  { value: "knees", label: "Knees" },
  { value: "calves", label: "Calves" },
  { value: "ankles_feet", label: "Ankles & feet" },
  { value: "full_body", label: "Full body" },
] as const;

/** Maps legacy saved-plan values to the expanded region list used for matching. */
export const expandBodyRegionsForMatch = (regions: readonly string[]): string[] => [
  ...new Set(
    regions.flatMap((region) => (region === "back" ? ["upper_back", "lower_back"] : [region])),
  ),
];

export const bodyRegionLabel = (value: string): string =>
  BODY_REGIONS.find((item) => item.value === value)?.label ??
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export const DIFFICULTIES = [
  { value: "iniciante", label: "Beginner" },
  { value: "intermediario", label: "Intermediate" },
  { value: "avancado", label: "Advanced" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: "none", label: "No equipment" },
  { value: "mat", label: "Mat" },
  { value: "band", label: "Resistance band" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "chair", label: "Chair" },
] as const;

export const EXERCISE_TYPES = [
  { value: "stretch", label: "Stretch" },
  { value: "mobility", label: "Mobility" },
  { value: "strength", label: "Strength" },
] as const;

export const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number]["value"];
export type Difficulty = (typeof DIFFICULTIES)[number]["value"];
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]["value"];

export const ADMIN_EMAILS = ["admin@gomove.fit"] as const;
