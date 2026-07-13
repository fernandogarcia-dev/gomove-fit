import { useMemo, useState } from "react";
import { Database, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildPublishedGuideMap,
  countGuideWords,
  fetchAllGuidesAdmin,
  getAllStaticLandingPages,
  getStaticLandingPage,
  guideFormFromPage,
  MIN_GUIDE_WORDS,
  pageFromGuideForm,
  syncAllStaticGuidesToDatabase,
  type BlogGuideForm,
  unpublishGuideAdmin,
  upsertGuideAdmin,
} from "@/lib/guides";

const emptyForm = (): BlogGuideForm => ({
  slug: "",
  title: "",
  h1: "",
  metaDescription: "",
  keywords: "",
  heroSubtitle: "",
  sectionsJson: "[]",
  faqsJson: "[]",
  relatedSlugs: "",
  published: true,
});

const AdminGuides = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<BlogGuideForm>(emptyForm());
  const [removeSlug, setRemoveSlug] = useState<string | null>(null);

  const { data: dbGuides = [], isLoading } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: fetchAllGuidesAdmin,
  });

  const staticGuides = useMemo(() => getAllStaticLandingPages(), []);

  const liveGuideMap = useMemo(
    () => buildPublishedGuideMap(dbGuides, staticGuides),
    [dbGuides, staticGuides],
  );

  const adminRows = useMemo(() => {
    const slugs = new Set([...staticGuides.map((g) => g.slug), ...dbGuides.map((g) => g.slug)]);
    return [...slugs]
      .sort((a, b) => a.localeCompare(b))
      .map((slug) => {
        const dbRow = dbGuides.find((g) => g.slug === slug);
        const live = liveGuideMap.get(slug);
        const fallback = getStaticLandingPage(slug);
        const preview = live ?? fallback;
        return {
          slug,
          preview,
          dbRow,
          live: Boolean(live),
          inDb: Boolean(dbRow),
        };
      })
      .filter((row) => row.preview || row.dbRow);
  }, [dbGuides, liveGuideMap, staticGuides]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adminRows;
    return adminRows.filter(
      (row) =>
        row.slug.includes(q) ||
        row.preview?.title.toLowerCase().includes(q) ||
        row.preview?.h1.toLowerCase().includes(q),
    );
  }, [adminRows, search]);

  const openEdit = (slug: string) => {
    const dbRow = dbGuides.find((g) => g.slug === slug);
    if (dbRow && dbRow.published) {
      setForm(
        guideFormFromPage(
          {
            slug: dbRow.slug,
            title: dbRow.title,
            h1: dbRow.h1,
            metaDescription: dbRow.meta_description,
            keywords: dbRow.keywords,
            heroSubtitle: dbRow.hero_subtitle,
            sections: dbRow.sections,
            faqs: dbRow.faqs,
            relatedSlugs: dbRow.related_slugs,
          },
          dbRow.published,
        ),
      );
    } else {
      const page = getStaticLandingPage(slug);
      if (page) setForm(guideFormFromPage(page, true));
    }
    setSheetOpen(true);
  };

  const openCreate = () => {
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => upsertGuideAdmin(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      queryClient.invalidateQueries({ queryKey: ["published-guides"] });
      setSheetOpen(false);
      toast({ title: "Guide saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save guide", description: error.message, variant: "destructive" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncAllStaticGuidesToDatabase,
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      queryClient.invalidateQueries({ queryKey: ["published-guides"] });
      toast({
        title: "Guides synced",
        description: `${count} long-form articles upserted into the database (replaced existing slugs).`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (slug: string) => unpublishGuideAdmin(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      queryClient.invalidateQueries({ queryKey: ["published-guides"] });
      setRemoveSlug(null);
      toast({ title: "Guide removed from site" });
    },
    onError: (error: Error) => {
      toast({ title: "Remove failed", description: error.message, variant: "destructive" });
    },
  });

  const previewWords = useMemo(() => {
    try {
      return countGuideWords(pageFromGuideForm(form));
    } catch {
      return 0;
    }
  }, [form]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search guides by slug or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Sync all to DB
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New guide
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Only long-form guides ({MIN_GUIDE_WORDS}+ words) are published. Sync replaces existing database
        rows by slug — it does not create duplicates.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => (
            <div
              key={row.slug}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{row.preview?.h1 ?? row.slug}</p>
                  {row.live ? (
                    <Badge variant="default">Live</Badge>
                  ) : (
                    <Badge variant="outline">Unpublished</Badge>
                  )}
                  {row.inDb ? <Badge variant="secondary">In DB</Badge> : null}
                  {row.preview ? (
                    <Badge variant="outline">{countGuideWords(row.preview)} words</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">/{row.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row.slug)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {row.live ? (
                  <Button variant="ghost" size="icon" onClick={() => setRemoveSlug(row.slug)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{form.slug ? `Edit ${form.slug}` : "New guide"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 pb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guide-slug">Slug *</Label>
                <Input
                  id="guide-slug"
                  value={form.slug}
                  onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
                  placeholder="beginner-home-workout"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Checkbox
                  id="guide-published"
                  checked={form.published}
                  onCheckedChange={(checked) =>
                    setForm((c) => ({ ...c, published: checked === true }))
                  }
                />
                <Label htmlFor="guide-published">Published</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-title">SEO title *</Label>
              <Input
                id="guide-title"
                value={form.title}
                onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-h1">H1 *</Label>
              <Input
                id="guide-h1"
                value={form.h1}
                onChange={(e) => setForm((c) => ({ ...c, h1: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-meta">Meta description *</Label>
              <Textarea
                id="guide-meta"
                rows={2}
                value={form.metaDescription}
                onChange={(e) => setForm((c) => ({ ...c, metaDescription: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-hero">Hero subtitle *</Label>
              <Textarea
                id="guide-hero"
                rows={2}
                value={form.heroSubtitle}
                onChange={(e) => setForm((c) => ({ ...c, heroSubtitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-keywords">Keywords (comma separated)</Label>
              <Input
                id="guide-keywords"
                value={form.keywords}
                onChange={(e) => setForm((c) => ({ ...c, keywords: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-related">Related slugs (comma separated)</Label>
              <Input
                id="guide-related"
                value={form.relatedSlugs}
                onChange={(e) => setForm((c) => ({ ...c, relatedSlugs: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-sections">Sections JSON *</Label>
              <Textarea
                id="guide-sections"
                rows={12}
                className="font-mono text-xs"
                value={form.sectionsJson}
                onChange={(e) => setForm((c) => ({ ...c, sectionsJson: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-faqs">FAQs JSON *</Label>
              <Textarea
                id="guide-faqs"
                rows={8}
                className="font-mono text-xs"
                value={form.faqsJson}
                onChange={(e) => setForm((c) => ({ ...c, faqsJson: e.target.value }))}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Preview: ~{previewWords.toLocaleString()} words (minimum {MIN_GUIDE_WORDS.toLocaleString()})
            </p>

            <Button
              className="w-full"
              disabled={!form.slug.trim() || !form.title.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : "Save guide"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(removeSlug)} onOpenChange={(open) => !open && setRemoveSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove guide {removeSlug}?</AlertDialogTitle>
            <AlertDialogDescription>
              Unpublishes this article site-wide. It will no longer appear in the blog or search results.
              You can edit and republish it later from this panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeSlug && removeMutation.mutate(removeSlug)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGuides;
