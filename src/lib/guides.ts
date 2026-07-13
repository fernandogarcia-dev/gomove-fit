import { supabase } from "@/integrations/supabase/client";
import {
  LANDING_PAGE_MAP,
  LANDING_PAGES,
  type SeoFaq,
  type SeoLandingPage,
  type SeoSection,
} from "@/lib/seo/landing-pages";
import {
  countGuideWords,
  isLongFormGuide,
  MIN_GUIDE_WORDS,
} from "@/lib/seo/guide-utils";

export { countGuideWords, isLongFormGuide, MIN_GUIDE_WORDS };

export type BlogGuideRow = {
  slug: string;
  title: string;
  h1: string;
  meta_description: string;
  keywords: string[];
  hero_subtitle: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  related_slugs: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogGuideForm = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  keywords: string;
  heroSubtitle: string;
  sectionsJson: string;
  faqsJson: string;
  relatedSlugs: string;
  published: boolean;
};

const rowToPage = (row: BlogGuideRow): SeoLandingPage => ({
  slug: row.slug,
  title: row.title,
  h1: row.h1,
  metaDescription: row.meta_description,
  keywords: row.keywords ?? [],
  heroSubtitle: row.hero_subtitle,
  sections: row.sections ?? [],
  faqs: row.faqs ?? [],
  relatedSlugs: row.related_slugs ?? [],
});

const pageToRow = (
  page: SeoLandingPage,
  published = true,
): Omit<BlogGuideRow, "created_at" | "updated_at"> => ({
  slug: page.slug,
  title: page.title,
  h1: page.h1,
  meta_description: page.metaDescription,
  keywords: page.keywords,
  hero_subtitle: page.heroSubtitle,
  sections: page.sections,
  faqs: page.faqs,
  related_slugs: page.relatedSlugs,
  published,
});

export const getStaticLandingPage = (slug: string): SeoLandingPage | undefined => {
  const page = LANDING_PAGE_MAP.get(slug);
  if (!page || !isLongFormGuide(page)) return undefined;
  return page;
};

export const getAllStaticLandingPages = (): SeoLandingPage[] =>
  LANDING_PAGES.filter(isLongFormGuide);

export const buildPublishedGuideMap = (
  dbRows: BlogGuideRow[],
  staticPages: SeoLandingPage[] = getAllStaticLandingPages(),
): Map<string, SeoLandingPage> => {
  const map = new Map<string, SeoLandingPage>();

  for (const page of staticPages) {
    map.set(page.slug, page);
  }

  for (const row of dbRows) {
    if (!row.published) {
      map.delete(row.slug);
      continue;
    }
    const page = rowToPage(row);
    if (isLongFormGuide(page)) {
      map.set(row.slug, page);
    }
  }

  return map;
};

export const guideFormFromPage = (page: SeoLandingPage, published = true): BlogGuideForm => ({
  slug: page.slug,
  title: page.title,
  h1: page.h1,
  metaDescription: page.metaDescription,
  keywords: page.keywords.join(", "),
  heroSubtitle: page.heroSubtitle,
  sectionsJson: JSON.stringify(page.sections, null, 2),
  faqsJson: JSON.stringify(page.faqs, null, 2),
  relatedSlugs: page.relatedSlugs.join(", "),
  published,
});

export const pageFromGuideForm = (form: BlogGuideForm): SeoLandingPage => ({
  slug: form.slug.trim(),
  title: form.title.trim(),
  h1: form.h1.trim(),
  metaDescription: form.metaDescription.trim(),
  keywords: form.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  heroSubtitle: form.heroSubtitle.trim(),
  sections: JSON.parse(form.sectionsJson) as SeoSection[],
  faqs: JSON.parse(form.faqsJson) as SeoFaq[],
  relatedSlugs: form.relatedSlugs
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
});

export const fetchPublishedGuides = async (): Promise<SeoLandingPage[]> => {
  const { data, error } = await supabase
    .from("blog_guides")
    .select("*")
    .order("slug");

  if (error) {
    console.warn("blog_guides fetch failed, using static long-form guides", error.message);
    return getAllStaticLandingPages();
  }

  if (!data?.length) return getAllStaticLandingPages();

  return [...buildPublishedGuideMap(data as BlogGuideRow[]).values()].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
};

export const fetchGuideBySlug = async (slug: string): Promise<SeoLandingPage | undefined> => {
  const { data, error } = await supabase.from("blog_guides").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    console.warn("blog_guides slug fetch failed, using static", error.message);
    return getStaticLandingPage(slug);
  }

  if (data) {
    const row = data as BlogGuideRow;
    if (!row.published) return undefined;
    const page = rowToPage(row);
    return isLongFormGuide(page) ? page : undefined;
  }

  return getStaticLandingPage(slug);
};

export const fetchAllGuidesAdmin = async (): Promise<BlogGuideRow[]> => {
  const { data, error } = await supabase.from("blog_guides").select("*").order("slug");
  if (error) throw error;
  return (data ?? []) as BlogGuideRow[];
};

export const upsertGuideAdmin = async (form: BlogGuideForm): Promise<void> => {
  const page = pageFromGuideForm(form);
  if (!isLongFormGuide(page)) {
    throw new Error(`Guide must have at least ${MIN_GUIDE_WORDS} words. Current: ${countGuideWords(page)}.`);
  }
  const row = pageToRow(page, form.published);
  const { error } = await supabase.from("blog_guides").upsert(row, { onConflict: "slug" });
  if (error) throw error;
};

export const deleteGuideAdmin = async (slug: string): Promise<void> => {
  const { error } = await supabase.from("blog_guides").delete().eq("slug", slug);
  if (error) throw error;
};

/** Hide a guide site-wide (including static fallback) */
export const unpublishGuideAdmin = async (slug: string): Promise<void> => {
  const staticPage = getStaticLandingPage(slug);
  const row = staticPage
    ? pageToRow(staticPage, false)
    : {
        slug,
        title: slug,
        h1: slug,
        meta_description: "Unpublished",
        keywords: [] as string[],
        hero_subtitle: "",
        sections: [] as SeoSection[],
        faqs: [] as SeoFaq[],
        related_slugs: [] as string[],
        published: false,
      };

  const { error } = await supabase.from("blog_guides").upsert(row, { onConflict: "slug" });
  if (error) throw error;
};

/** Upsert all long-form static guides into blog_guides (replaces existing rows by slug) */
export const syncAllStaticGuidesToDatabase = async (): Promise<number> => {
  const pages = getAllStaticLandingPages();
  const rows = pages.map((page) => pageToRow(page, true));
  const BATCH = 20;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("blog_guides").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }

  return rows.length;
};
