import { buildAllLandingPages } from "./guide-content-builder";
import { assertLongFormGuides } from "./guide-utils";

export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoLandingPage = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  keywords: string[];
  heroSubtitle: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  relatedSlugs: string[];
};

export const US_STATES = [
  { slug: "alabama", name: "Alabama", abbr: "AL" },
  { slug: "alaska", name: "Alaska", abbr: "AK" },
  { slug: "arizona", name: "Arizona", abbr: "AZ" },
  { slug: "arkansas", name: "Arkansas", abbr: "AR" },
  { slug: "california", name: "California", abbr: "CA" },
  { slug: "colorado", name: "Colorado", abbr: "CO" },
  { slug: "connecticut", name: "Connecticut", abbr: "CT" },
  { slug: "delaware", name: "Delaware", abbr: "DE" },
  { slug: "florida", name: "Florida", abbr: "FL" },
  { slug: "georgia", name: "Georgia", abbr: "GA" },
  { slug: "hawaii", name: "Hawaii", abbr: "HI" },
  { slug: "idaho", name: "Idaho", abbr: "ID" },
  { slug: "illinois", name: "Illinois", abbr: "IL" },
  { slug: "indiana", name: "Indiana", abbr: "IN" },
  { slug: "iowa", name: "Iowa", abbr: "IA" },
  { slug: "kansas", name: "Kansas", abbr: "KS" },
  { slug: "kentucky", name: "Kentucky", abbr: "KY" },
  { slug: "louisiana", name: "Louisiana", abbr: "LA" },
  { slug: "maine", name: "Maine", abbr: "ME" },
  { slug: "maryland", name: "Maryland", abbr: "MD" },
  { slug: "massachusetts", name: "Massachusetts", abbr: "MA" },
  { slug: "michigan", name: "Michigan", abbr: "MI" },
  { slug: "minnesota", name: "Minnesota", abbr: "MN" },
  { slug: "mississippi", name: "Mississippi", abbr: "MS" },
  { slug: "missouri", name: "Missouri", abbr: "MO" },
  { slug: "montana", name: "Montana", abbr: "MT" },
  { slug: "nebraska", name: "Nebraska", abbr: "NE" },
  { slug: "nevada", name: "Nevada", abbr: "NV" },
  { slug: "new-hampshire", name: "New Hampshire", abbr: "NH" },
  { slug: "new-jersey", name: "New Jersey", abbr: "NJ" },
  { slug: "new-mexico", name: "New Mexico", abbr: "NM" },
  { slug: "new-york", name: "New York", abbr: "NY" },
  { slug: "north-carolina", name: "North Carolina", abbr: "NC" },
  { slug: "north-dakota", name: "North Dakota", abbr: "ND" },
  { slug: "ohio", name: "Ohio", abbr: "OH" },
  { slug: "oklahoma", name: "Oklahoma", abbr: "OK" },
  { slug: "oregon", name: "Oregon", abbr: "OR" },
  { slug: "pennsylvania", name: "Pennsylvania", abbr: "PA" },
  { slug: "rhode-island", name: "Rhode Island", abbr: "RI" },
  { slug: "south-carolina", name: "South Carolina", abbr: "SC" },
  { slug: "south-dakota", name: "South Dakota", abbr: "SD" },
  { slug: "tennessee", name: "Tennessee", abbr: "TN" },
  { slug: "texas", name: "Texas", abbr: "TX" },
  { slug: "utah", name: "Utah", abbr: "UT" },
  { slug: "vermont", name: "Vermont", abbr: "VT" },
  { slug: "virginia", name: "Virginia", abbr: "VA" },
  { slug: "washington", name: "Washington", abbr: "WA" },
  { slug: "west-virginia", name: "West Virginia", abbr: "WV" },
  { slug: "wisconsin", name: "Wisconsin", abbr: "WI" },
  { slug: "wyoming", name: "Wyoming", abbr: "WY" },
  { slug: "district-of-columbia", name: "Washington D.C.", abbr: "DC" },
] as const;

export const BODY_REGION_SEO = [
  { slug: "neck", label: "Neck", pain: "neck pain and stiffness" },
  {
    slug: "shoulders",
    label: "Shoulders",
    pain: "shoulder tension and tightness",
  },
  { slug: "upper-back", label: "Upper Back", pain: "upper back pain" },
  { slug: "lower-back", label: "Lower Back", pain: "lower back pain" },
  { slug: "chest", label: "Chest", pain: "chest tightness" },
  { slug: "elbows", label: "Elbows", pain: "elbow discomfort" },
  {
    slug: "wrists-hands",
    label: "Wrists & Hands",
    pain: "wrist and hand strain",
  },
  { slug: "core", label: "Core", pain: "core weakness and abdominal tension" },
  { slug: "hips", label: "Hips", pain: "hip tightness and discomfort" },
  { slug: "glutes", label: "Glutes", pain: "glute soreness and hip imbalance" },
  { slug: "thighs", label: "Thighs", pain: "thigh tightness" },
  { slug: "knees", label: "Knees", pain: "knee discomfort" },
  { slug: "calves", label: "Calves", pain: "calf tightness" },
  {
    slug: "ankles-feet",
    label: "Ankles & Feet",
    pain: "ankle and foot stiffness",
  },
] as const;

export const LANDING_PAGES: SeoLandingPage[] = buildAllLandingPages();

assertLongFormGuides(LANDING_PAGES);

export const LANDING_PAGE_MAP = new Map(
  LANDING_PAGES.map((page) => [page.slug, page]),
);

export const getLandingPage = (slug: string): SeoLandingPage | undefined =>
  LANDING_PAGE_MAP.get(slug);

export const getAllLandingSlugs = (): string[] =>
  LANDING_PAGES.map((page) => page.slug);

export const GUIDE_CATEGORIES = [
  {
    title: "Home & apartment workouts",
    slugs: [
      "home-workouts",
      "workout-at-home-no-gym",
      "apartment-gym-workout",
      "condo-gym-exercises",
      "no-equipment-workout",
      "workout-without-gym-membership",
      "small-space-workout",
    ],
  },
  {
    title: "Equipment-based home training",
    slugs: [
      "resistance-band-workout-at-home",
      "dumbbell-workout-at-home",
      "chair-exercises-at-home",
    ],
  },
  {
    title: "Pain & body region guides",
    slugs: BODY_REGION_SEO.map((r) => `${r.slug}-pain-exercises-at-home`),
  },
  {
    title: "Lifestyle & beginner guides",
    slugs: [
      "beginner-home-workout",
      "senior-exercises-at-home",
      "work-from-home-exercises",
      "stretching-at-home",
      "mobility-exercises-at-home",
    ],
  },
  {
    title: "Home workouts by US state",
    slugs: US_STATES.map((s) => `home-workout-${s.slug}`),
  },
] as const;
