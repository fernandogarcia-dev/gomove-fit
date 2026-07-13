type GuideWordCountable = {
  slug?: string;
  h1: string;
  heroSubtitle: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { question: string; answer: string }[];
};

/** Long-form guides only — short legacy articles are rejected */
export const MIN_GUIDE_WORDS = 1200;

export const countGuideWords = (page: GuideWordCountable): number => {
  const text = [
    page.h1,
    page.heroSubtitle,
    ...page.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
};

export const isLongFormGuide = (page: GuideWordCountable): boolean =>
  countGuideWords(page) >= MIN_GUIDE_WORDS;

export const assertLongFormGuides = (pages: GuideWordCountable[]): void => {
  for (const page of pages) {
    const words = countGuideWords(page);
    if (words < MIN_GUIDE_WORDS) {
      const slug = page.slug ?? "unknown";
      throw new Error(
        `Guide "${slug}" has only ${words} words (minimum ${MIN_GUIDE_WORDS}). Short articles are not allowed.`,
      );
    }
  }
};
