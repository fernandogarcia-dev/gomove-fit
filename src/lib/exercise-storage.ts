import { supabase } from "@/integrations/supabase/client";

const BUCKET = "exercise-images";

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Upload an exercise image to Supabase Storage and return its public URL. */
export const uploadExerciseImage = async (
  file: File,
  exerciseName: string,
  exerciseId?: string,
): Promise<string> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const base = exerciseId ?? (slugify(exerciseName) || "new");
  const path = `${base}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "image/webp",
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const removeExerciseImage = async (imageUrl: string): Promise<void> => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(imageUrl.slice(index + marker.length));
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
};
