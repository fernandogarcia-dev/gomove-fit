import type { SeoLandingPage } from "./landing-pages";
import { GUIDE_CATEGORIES, LANDING_PAGES } from "./landing-pages";
import { SITE_URL } from "./site";

export type BlogCategoryId =
  | "home-apartment"
  | "equipment"
  | "pain-relief"
  | "lifestyle"
  | "states";

export type BlogCategory = {
  id: BlogCategoryId;
  title: string;
  coverImage: string;
  coverAlt: string;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "home-apartment",
    title: "Home & apartment workouts",
    coverImage: "/blog/covers/home-apartment.webp",
    coverAlt: "Home and apartment gym workout guides",
  },
  {
    id: "equipment",
    title: "Equipment-based home training",
    coverImage: "/blog/covers/equipment.webp",
    coverAlt: "Resistance bands, dumbbells, and chair workout guides",
  },
  {
    id: "pain-relief",
    title: "Pain & body region guides",
    coverImage: "/blog/covers/pain-relief.webp",
    coverAlt: "Gentle pain relief and mobility exercises at home",
  },
  {
    id: "lifestyle",
    title: "Lifestyle & beginner guides",
    coverImage: "/blog/covers/lifestyle.webp",
    coverAlt: "Beginner, senior, and work-from-home exercise guides",
  },
  {
    id: "states",
    title: "Home workouts by US state",
    coverImage: "/blog/covers/states.webp",
    coverAlt: "State-by-state home workout guides across the USA",
  },
];

const CATEGORY_BY_TITLE = new Map(GUIDE_CATEGORIES.map((cat, index) => [cat.title, BLOG_CATEGORIES[index]]));

const SLUG_CATEGORY_MAP = new Map<string, BlogCategoryId>();

for (const category of GUIDE_CATEGORIES) {
  const blogCategory = CATEGORY_BY_TITLE.get(category.title);
  if (!blogCategory) continue;
  for (const slug of category.slugs) {
    SLUG_CATEGORY_MAP.set(slug, blogCategory.id);
  }
}

export const FEATURED_BLOG_SLUGS = [
  "home-workouts",
  "apartment-gym-workout",
  "no-equipment-workout",
  "lower-back-pain-exercises-at-home",
  "beginner-home-workout",
  "home-workout-california",
] as const;

const SLUG_INDEX_MAP = new Map(LANDING_PAGES.map((page, index) => [page.slug, index]));

export const getBlogCategoryForSlug = (slug: string): BlogCategory => {
  const id = SLUG_CATEGORY_MAP.get(slug) ?? "home-apartment";
  return BLOG_CATEGORIES.find((cat) => cat.id === id) ?? BLOG_CATEGORIES[0];
};

export const getBlogCoverImage = (slug: string): string => getBlogCategoryForSlug(slug).coverImage;

export const getBlogCoverAlt = (slug: string, page?: SeoLandingPage): string =>
  page ? `${page.h1} — GoMove home workout guide` : getBlogCategoryForSlug(slug).coverAlt;

export const getBlogCoverUrl = (slug: string): string => `${SITE_URL}${getBlogCoverImage(slug)}`;

export const estimateReadTimeMinutes = (page: SeoLandingPage): number => {
  const text = [
    page.h1,
    page.heroSubtitle,
    ...page.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(" ");

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.min(12, Math.round(words / 220)));
};

/** Stable publish dates for SEO — spread across 2025–2026 by catalog order */
export const getPublishedDate = (slug: string): string => {
  const index = SLUG_INDEX_MAP.get(slug) ?? 0;
  const day = (index % 27) + 1;
  const month = (index % 12) + 1;
  const year = index < 40 ? 2025 : 2026;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const formatBlogDate = (isoDate: string): string =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
