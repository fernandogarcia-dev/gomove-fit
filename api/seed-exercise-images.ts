import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "./_lib/supabase-admin.js";

const IMAGE_MAP: Record<string, string> = {
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

/** One-time seed: POST /api/seed-exercise-images with header x-seed-secret matching SEED_SECRET env var */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.SEED_SECRET;
  if (!secret || req.headers["x-seed-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const baseUrl = (process.env.APP_URL ?? "https://gomove.fit").replace(/\/$/, "");
  const supabase = getSupabaseAdmin();

  const { data: exercises, error: listError } = await supabase
    .from("exercises")
    .select("id, name, image_url");

  if (listError) {
    return res.status(500).json({ error: listError.message });
  }

  let updated = 0;
  for (const exercise of exercises ?? []) {
    const slug = IMAGE_MAP[exercise.name];
    if (!slug || exercise.image_url) continue;

    const image_url = `${baseUrl}/exercises/${slug}.webp`;
    const { error } = await supabase.from("exercises").update({ image_url }).eq("id", exercise.id);
    if (error) {
      return res.status(500).json({ error: error.message, exercise: exercise.name });
    }
    updated += 1;
  }

  return res.status(200).json({ updated, total: exercises?.length ?? 0 });
}
