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

export const exerciseImageUrl = (name: string, baseUrl = "https://www.gomove.fit"): string | null => {
  const slug = EXERCISE_IMAGE_SLUGS[name];
  if (!slug) return null;
  return `${baseUrl.replace(/\/$/, "")}/exercises/${slug}.webp`;
};

export const isLocalExerciseImageUrl = (imageUrl?: string | null): boolean => {
  if (!imageUrl) return false;
  try {
    const url = new URL(imageUrl, "https://www.gomove.fit");
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

/**
 * Returns a browser-safe image URL and repairs legacy localhost URLs that were
 * accidentally written to the shared database by local admin seeding.
 */
export const resolveExerciseImageUrl = (
  name: string,
  imageUrl?: string | null,
): string | null => {
  const defaultPath = EXERCISE_IMAGE_SLUGS[name]
    ? `/exercises/${EXERCISE_IMAGE_SLUGS[name]}.webp`
    : null;

  if (!imageUrl) return defaultPath;

  try {
    const url = new URL(imageUrl, "https://www.gomove.fit");
    if (isLocalExerciseImageUrl(imageUrl)) {
      return defaultPath ?? `${url.pathname}${url.search}`;
    }
  } catch {
    return defaultPath;
  }

  return imageUrl;
};

/** Local dev fallback when production URLs are not deployed yet */
export const exerciseImageUrlForEnv = (name: string): string | null => {
  const slug = EXERCISE_IMAGE_SLUGS[name];
  if (!slug) return null;
  if (import.meta.env.DEV) return `/exercises/${slug}.webp`;
  return exerciseImageUrl(name);
};
