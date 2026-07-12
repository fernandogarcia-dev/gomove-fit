import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadExerciseImage } from "@/lib/exercise-storage";
import { useToast } from "@/hooks/use-toast";

type ExerciseImageFieldProps = {
  value: string;
  exerciseName: string;
  exerciseId?: string | null;
  onChange: (url: string) => void;
};

const ExerciseImageField = ({
  value,
  exerciseName,
  exerciseId,
  onChange,
}: ExerciseImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!exerciseName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Enter the exercise name before uploading an image.",
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadExerciseImage(file, exerciseName.trim(), exerciseId ?? undefined);
      onChange(url);
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload image",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Label>Exercise image</Label>

      {value ? (
        <div className="flex items-start gap-3">
          <img
            src={value}
            alt={exerciseName || "Exercise preview"}
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
            <Trash2 className="mr-1 h-4 w-4" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-1 h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload image"}
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="image_url" className="text-xs text-muted-foreground">
          Or paste image URL
        </Label>
        <Input
          id="image_url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... (.webp recommended)"
        />
      </div>
    </div>
  );
};

export default ExerciseImageField;
