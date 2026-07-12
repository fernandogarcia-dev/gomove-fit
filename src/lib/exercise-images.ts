/** Default exercise thumbnails — served from /exercises/*.webp after deploy */
export const EXERCISE_IMAGE_SLUGS: Record<string, string> = {
  "Chin tuck": "chin-tuck",
  "Upper trap stretch": "upper-trap-stretch",
  "Doorway chest stretch": "doorway-chest-stretch",
  "Wall angels": "wall-angels",
  "Band external rotation": "band-external-rotation",
  "Cat-cow": "cat-cow",
  "Child's pose": "childs-pose",
  "Bird dog": "bird-dog",
  "Glute bridge": "glute-bridge",
  "Figure-four stretch": "figure-four-stretch",
  Clamshell: "clamshell",
  "Heel slides": "heel-slides",
  "Straight leg raise": "straight-leg-raise",
  "Sit-to-stand": "sit-to-stand",
  "March in place": "march-in-place",
  "Bodyweight squat": "bodyweight-squat",
};

export const exerciseImageUrl = (name: string, baseUrl = "https://gomove.fit"): string | null => {
  const slug = EXERCISE_IMAGE_SLUGS[name];
  if (!slug) return null;
  return `${baseUrl.replace(/\/$/, "")}/exercises/${slug}.webp`;
};

/** Local dev fallback when production URLs are not deployed yet */
export const exerciseImageUrlForEnv = (name: string): string | null => {
  const slug = EXERCISE_IMAGE_SLUGS[name];
  if (!slug) return null;
  if (import.meta.env.DEV) return `/exercises/${slug}.webp`;
  return exerciseImageUrl(name);
};
