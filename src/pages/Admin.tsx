import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const emptyForm = (): ExerciseForm => ({
  name: "",
  body_region: "back",
  exercise_type: "stretch",
  difficulty: "iniciante",
  equipment: ["none"],
  instructions: "",
  sets_reps: "",
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
  image_url: exercise.image_url ?? "",
  video_url: exercise.video_url ?? "",
});

const AdminContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ExerciseForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["admin-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const invalidateCatalog = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
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
      };

      if (editingId) {
        const { error } = await supabase.from("exercises").update(payload).eq("id", editingId);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("exercises").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCatalog();
      setForm(emptyForm());
      setEditingId(null);
      toast({ title: editingId ? "Exercise updated" : "Exercise created" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: editingId ? "Could not update exercise" : "Could not create exercise",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCatalog();
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm());
      }
      toast({ title: "Exercise deleted" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Could not delete exercise",
        description: error instanceof Error ? error.message : "Unexpected error",
      });
    },
  });

  const toggleEquipment = (value: Equipment, checked: boolean) => {
    setForm((current) => {
      if (checked) return { ...current, equipment: [...new Set([...current.equipment, value])] };
      const next = current.equipment.filter((item) => item !== value);
      return { ...current, equipment: next.length > 0 ? next : ["none"] };
    });
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm(exerciseToForm(exercise));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  return (
    <AppShell title="Admin" showBack backTo="/">
      <div className="space-y-6">
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              {editingId ? "Edit exercise" : "Add exercise"}
            </h2>
            {editingId ? (
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Body region</Label>
              <Select
                value={form.body_region}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, body_region: value as BodyRegion }))
                }
              >
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
              <Label>Type</Label>
              <Select
                value={form.exercise_type}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, exercise_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, difficulty: value as Difficulty }))
                }
              >
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
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, duration_minutes: event.target.value }))
                }
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
            <Label htmlFor="sets">Sets / reps</Label>
            <Input
              id="sets"
              value={form.sets_reps}
              onChange={(event) =>
                setForm((current) => ({ ...current, sets_reps: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={form.instructions}
              onChange={(event) =>
                setForm((current) => ({ ...current, instructions: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={form.benefits}
              onChange={(event) =>
                setForm((current) => ({ ...current, benefits: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contraindications">Contraindications</Label>
            <Textarea
              id="contraindications"
              value={form.contraindications}
              onChange={(event) =>
                setForm((current) => ({ ...current, contraindications: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              placeholder="https://..."
              value={form.image_url}
              onChange={(event) =>
                setForm((current) => ({ ...current, image_url: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              An easy-to-recognize photo or illustration showing the exercise position.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              placeholder="https://..."
              value={form.video_url}
              onChange={(event) =>
                setForm((current) => ({ ...current, video_url: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Demonstration video (MP4 link). Only visible to GoMove PRO subscribers in the app.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => saveMutation.mutate()}
            disabled={!form.name.trim() || saveMutation.isPending}
          >
            {editingId ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Update exercise"}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Create exercise"}
              </>
            )}
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Catalog ({exercises.length})</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No exercises yet. Add your first exercise above.
            </p>
          ) : (
            exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {exercise.image_url ? (
                      <img src={exercise.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.body_region} · {exercise.difficulty}
                      {exercise.video_url ? " · 🎬 video" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(exercise)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(exercise.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
};

const Admin = () => (
  <ProtectedRoute adminOnly>
    <AdminContent />
  </ProtectedRoute>
);

export default Admin;
