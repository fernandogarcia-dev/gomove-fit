import { useMemo, useState, useEffect, useRef } from "react";
import {
  Film,
  ImageOff,
  Images,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import ExerciseImageField from "@/components/admin/ExerciseImageField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BODY_REGIONS,
  DIFFICULTIES,
  EQUIPMENT_OPTIONS,
  EXERCISE_TYPES,
  type BodyRegion,
  type Difficulty,
  type Equipment,
} from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { withTimeout } from "@/lib/query-utils";
import {
  EXERCISE_IMAGE_SLUGS,
  exerciseImageUrl,
  isLocalExerciseImageUrl,
  resolveExerciseImageUrl,
} from "@/lib/exercise-images";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Exercise = Database["public"]["Tables"]["exercises"]["Row"];

type ExerciseForm = {
  name: string;
  body_region: BodyRegion;
  exercise_type: string;
  difficulty: Difficulty;
  equipment: Equipment[];
  instructions: string;
  sets_reps: string;
  duration_minutes: string;
  benefits: string;
  contraindications: string;
  image_url: string;
  video_url: string;
};

type MediaFilter = "all" | "with_image" | "missing_image" | "with_video";

const emptyForm = (): ExerciseForm => ({
  name: "",
  body_region: "lower_back",
  exercise_type: "stretch",
  difficulty: "iniciante",
  equipment: ["none"],
  instructions: "",
  sets_reps: "2 sets of 10",
  duration_minutes: "10",
  benefits: "",
  contraindications: "",
  image_url: "",
  video_url: "",
});

const exerciseToForm = (exercise: Exercise): ExerciseForm => ({
  name: exercise.name,
  body_region: exercise.body_region as BodyRegion,
  exercise_type: exercise.exercise_type,
  difficulty: exercise.difficulty as Difficulty,
  equipment: (exercise.equipment ?? ["none"]) as Equipment[],
  instructions: exercise.instructions ?? "",
  sets_reps: exercise.sets_reps ?? "",
  duration_minutes: String(exercise.duration_minutes ?? 10),
  benefits: exercise.benefits ?? "",
  contraindications: exercise.contraindications ?? "",
  image_url: resolveExerciseImageUrl(exercise.name, exercise.image_url) ?? "",
  video_url: exercise.video_url ?? "",
});

const regionLabel = (value: string) =>
  BODY_REGIONS.find((item) => item.value === value)?.label ?? value;

const difficultyLabel = (value: string) =>
  DIFFICULTIES.find((item) => item.value === value)?.label ?? value;

const AdminContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<ExerciseForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const autoSeedAttempted = useRef(false);

  const { data: exercises = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-exercises"],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from("exercises").select("*").order("name"),
        10_000,
        "Admin exercises",
      );
      if (error) throw error;
      return data;
    },
    retry: 1,
  });

  const stats = useMemo(
    () => ({
      total: exercises.length,
      withImage: exercises.filter((item) => item.image_url).length,
      withVideo: exercises.filter((item) => item.video_url).length,
    }),
    [exercises],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.body_region.toLowerCase().includes(term) ||
        (item.instructions ?? "").toLowerCase().includes(term);
      const matchesRegion = regionFilter === "all" || item.body_region === regionFilter;
      const matchesDifficulty = difficultyFilter === "all" || item.difficulty === difficultyFilter;
      const matchesType = typeFilter === "all" || item.exercise_type === typeFilter;
      const matchesMedia =
        mediaFilter === "all" ||
        (mediaFilter === "with_image" && Boolean(item.image_url)) ||
        (mediaFilter === "missing_image" && !item.image_url) ||
        (mediaFilter === "with_video" && Boolean(item.video_url));
      return matchesSearch && matchesRegion && matchesDifficulty && matchesType && matchesMedia;
    });
  }, [exercises, search, regionFilter, difficultyFilter, typeFilter, mediaFilter]);

  const invalidateCatalog = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm(exerciseToForm(exercise));
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const toggleEquipment = (value: Equipment, checked: boolean) => {
    setForm((current) => {
      if (checked) return { ...current, equipment: [...new Set([...current.equipment, value])] };
      const next = current.equipment.filter((item) => item !== value);
      return { ...current, equipment: next.length > 0 ? next : ["none"] };
    });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    body_region: form.body_region,
    exercise_type: form.exercise_type,
    difficulty: form.difficulty,
    equipment: form.equipment,
    instructions: form.instructions.trim() || null,
    sets_reps: form.sets_reps.trim() || null,
    duration_minutes: Number(form.duration_minutes) || null,
    benefits: form.benefits.trim() || null,
    contraindications: form.contraindications.trim() || null,
    image_url: form.image_url.trim() || null,
    video_url: form.video_url.trim() || null,
    created_by: user!.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fullPayload = buildPayload();
      const { video_url, ...withoutVideo } = fullPayload;

      const attemptSave = async (payload: typeof fullPayload) => {
        if (editingId) {
          return withTimeout(
            supabase.from("exercises").update(payload).eq("id", editingId),
            10_000,
            "Update exercise",
          );
        }
        return withTimeout(supabase.from("exercises").insert(payload), 10_000, "Create exercise");
      };

      let result = await attemptSave(fullPayload);
      if (result.error?.message?.includes("video_url")) {
        result = await attemptSave(withoutVideo);
        if (!result.error && video_url) {
          console.warn("video_url column missing — saved without video. Run SQL migration.");
        }
      }
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      invalidateCatalog();
      closeSheet();
      toast({ title: editingId ? "Exercise updated" : "Exercise created" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast({
        variant: "destructive",
        title: editingId ? "Could not update" : "Could not create",
        description: message.includes("video_url")
          ? "Run scripts/RUN_IN_SUPABASE_SQL_EDITOR.sql first to enable video URLs."
          : message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase.from("exercises").delete().eq("id", id),
        10_000,
        "Delete exercise",
      );
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCatalog();
      setDeleteTarget(null);
      toast({ title: "Exercise deleted" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    },
  });

  const seedImagesMutation = useMutation({
    mutationFn: async () => {
      const missing = exercises.filter(
        (item) =>
          (!item.image_url || isLocalExerciseImageUrl(item.image_url)) &&
          EXERCISE_IMAGE_SLUGS[item.name],
      );
      for (const exercise of missing) {
        const image_url = exerciseImageUrl(exercise.name);
        if (!image_url) continue;
        const { error } = await supabase
          .from("exercises")
          .update({ image_url })
          .eq("id", exercise.id);
        if (error) throw error;
      }
      return missing.length;
    },
    onSuccess: (count) => {
      invalidateCatalog();
      if (count > 0) {
        toast({ title: `Applied images to ${count} exercises` });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Could not apply default images",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    },
  });

  useEffect(() => {
    if (
      !isLoading &&
      exercises.length > 0 &&
      exercises.some(
        (item) =>
          (!item.image_url || isLocalExerciseImageUrl(item.image_url)) &&
          EXERCISE_IMAGE_SLUGS[item.name],
      ) &&
      !autoSeedAttempted.current &&
      !seedImagesMutation.isPending
    ) {
      autoSeedAttempted.current = true;
      seedImagesMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when catalog loads
  }, [isLoading, exercises.length]);

  return (
    <AppShell title="Exercise admin" showBack backTo="/">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg border bg-card p-2">
            <p className="text-lg font-semibold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border bg-card p-2">
            <p className="text-lg font-semibold">{stats.withImage}</p>
            <p className="text-xs text-muted-foreground">With image</p>
          </div>
          <div className="rounded-lg border bg-card p-2">
            <p className="text-lg font-semibold">{stats.withVideo}</p>
            <p className="text-xs text-muted-foreground">With video</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or instructions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
          <Button
            variant="outline"
            onClick={() => seedImagesMutation.mutate()}
            disabled={seedImagesMutation.isPending}
            title="Apply bundled .webp thumbnails to exercises missing images"
          >
            {seedImagesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Images className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {BODY_REGIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {DIFFICULTIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EXERCISE_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mediaFilter} onValueChange={(v) => setMediaFilter(v as MediaFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Media" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All media</SelectItem>
              <SelectItem value="with_image">Has image</SelectItem>
              <SelectItem value="missing_image">Missing image</SelectItem>
              <SelectItem value="with_video">Has video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {exercises.length} exercises
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading catalog...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 p-4 text-center">
            <p className="font-medium">Could not load exercises</p>
            <Button className="mt-3" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No exercises match your filters</p>
            <Button className="mt-4" variant="outline" onClick={() => {
              setSearch("");
              setRegionFilter("all");
              setDifficultyFilter("all");
              setTypeFilter("all");
              setMediaFilter("all");
            }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {resolveExerciseImageUrl(exercise.name, exercise.image_url) ? (
                    <img
                      src={resolveExerciseImageUrl(exercise.name, exercise.image_url)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-medium">{exercise.name}</p>
                    {exercise.video_url ? (
                      <Badge variant="secondary" className="gap-0.5 text-[10px]">
                        <Film className="h-3 w-3" />
                        Video
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {regionLabel(exercise.body_region)} · {difficultyLabel(exercise.difficulty)}
                    {exercise.duration_minutes ? ` · ${exercise.duration_minutes} min` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(exercise)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(exercise)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit exercise" : "New exercise"}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-5 pb-8">
            <ExerciseImageField
              value={form.image_url}
              exerciseName={form.name}
              exerciseId={editingId}
              onChange={(image_url) => setForm((c) => ({ ...c, image_url }))}
            />

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Body region</Label>
                <Select
                  value={form.body_region}
                  onValueChange={(v) => setForm((c) => ({ ...c, body_region: v as BodyRegion }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BODY_REGIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.exercise_type}
                  onValueChange={(v) => setForm((c) => ({ ...c, exercise_type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm((c) => ({ ...c, difficulty: v as Difficulty }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) => setForm((c) => ({ ...c, duration_minutes: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Equipment</Label>
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.equipment.includes(item.value)}
                      onCheckedChange={(checked) => toggleEquipment(item.value, checked === true)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">How to do it *</Label>
              <Textarea
                id="instructions"
                rows={4}
                value={form.instructions}
                onChange={(e) => setForm((c) => ({ ...c, instructions: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sets">Sets / reps</Label>
              <Input
                id="sets"
                value={form.sets_reps}
                onChange={(e) => setForm((c) => ({ ...c, sets_reps: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                rows={2}
                value={form.benefits}
                onChange={(e) => setForm((c) => ({ ...c, benefits: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraindications">Contraindications / safety</Label>
              <Textarea
                id="contraindications"
                rows={2}
                value={form.contraindications}
                onChange={(e) => setForm((c) => ({ ...c, contraindications: e.target.value }))}
              />
            </div>

            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label htmlFor="video_url" className="flex items-center gap-1.5">
                <Film className="h-4 w-4" />
                Demonstration video (PRO subscribers only)
              </Label>
              <Input
                id="video_url"
                value={form.video_url}
                onChange={(e) => setForm((c) => ({ ...c, video_url: e.target.value }))}
                placeholder="https://... (MP4 or hosted video link)"
              />
              <p className="text-xs text-muted-foreground">
                Paste a direct video URL. Requires the PRO migration on Supabase to save.
              </p>
              {form.video_url ? (
                <video src={form.video_url} controls className="mt-2 w-full rounded-lg" />
              ) : null}
            </div>

            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={!form.name.trim() || !form.instructions.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Save changes" : "Create exercise"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the exercise from the catalog. Saved plans referencing it may break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

const Admin = () => (
  <ProtectedRoute adminOnly>
    <AdminContent />
  </ProtectedRoute>
);

export default Admin;
