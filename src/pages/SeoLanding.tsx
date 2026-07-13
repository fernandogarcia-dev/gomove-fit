import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";
import AdSlot from "@/components/ads/AdSlot";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  estimateReadTimeMinutes,
  formatBlogDate,
  getBlogCategoryForSlug,
  getBlogCoverAlt,
  getBlogCoverImage,
  getBlogCoverUrl,
  getPublishedDate,
} from "@/lib/seo/blog-meta";
import { getLandingPage } from "@/lib/seo/landing-pages";
import { fetchGuideBySlug, getStaticLandingPage } from "@/lib/guides";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import NotFound from "@/pages/NotFound";

const SeoLanding = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const staticPage = getStaticLandingPage(slug) ?? getLandingPage(slug);

  const { data: page } = useQuery({
    queryKey: ["guide", slug],
    queryFn: () => fetchGuideBySlug(slug),
    enabled: Boolean(slug),
    initialData: staticPage,
    staleTime: 5 * 60 * 1000,
  });

  if (!page) {
    return <NotFound />;
  }

  const path = `/guides/${page.slug}`;
  const coverImage = getBlogCoverUrl(page.slug);
  const publishedDate = getPublishedDate(page.slug);
  const readTime = estimateReadTimeMinutes(page);
  const category = getBlogCategoryForSlug(page.slug);
  const relatedPages = page.relatedSlugs
    .map((relatedSlug) => getStaticLandingPage(relatedSlug) ?? getLandingPage(relatedSlug))
    .filter((related): related is NonNullable<typeof related> => Boolean(related));

  const midSectionIndex = Math.max(0, Math.floor(page.sections.length / 2) - 1);

  return (
    <AppShell showBack backTo="/guides" title="Guides" wide>
      <SeoHead
        title={page.title}
        description={page.metaDescription}
        path={path}
        keywords={page.keywords}
        image={coverImage}
        ogType="article"
        jsonLd={[
          articleJsonLd({
            title: page.title,
            description: page.metaDescription,
            path,
            keywords: page.keywords,
            image: coverImage,
            datePublished: publishedDate,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: page.h1, path },
          ]),
          faqJsonLd(page.faqs),
        ]}
      />

      <article className="prose prose-sm max-w-none dark:prose-invert">
        <header className="not-prose mb-6">
          <p className="text-sm font-medium text-primary">{category.title}</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {page.h1}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{page.heroSubtitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={publishedDate}>{formatBlogDate(publishedDate)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readTime} min read
            </span>
          </div>
        </header>

        <figure className="not-prose -mx-1 mb-8 overflow-hidden rounded-xl border border-border">
          <img
            src={getBlogCoverImage(page.slug)}
            alt={getBlogCoverAlt(page.slug, page)}
            width={800}
            height={450}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>

        <AdSlot placement="article-top" variant="banner" />

        <div className="not-prose my-8">
          <Link to="/plan">
            <Button size="lg" className="gap-2 font-semibold">
              Build my free plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {page.sections.map((section, index) => (
          <section key={section.heading} className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {index === midSectionIndex ? (
              <AdSlot placement="article-mid" variant="rectangle" className="not-prose" />
            ) : null}
          </section>
        ))}

        <section className="not-prose mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">
            Why Americans choose GoMove over random YouTube workouts
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Personalized to your discomfort areas, fitness level, and equipment",
              "Works with no gear, home items, or your apartment building gym",
              "Weekly structure with progress tracking, not endless scrolling",
              "Safety notes and contraindications on every exercise",
              "Free to start. No gym membership or personal trainer required",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="not-prose w-full">
            {page.faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <AdSlot placement="article-bottom" variant="in-feed" />

        {relatedPages.length > 0 ? (
          <section className="not-prose mb-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Related guides</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {relatedPages.map((related) => (
                <li key={related.slug}>
                  <Link
                    to={`/guides/${related.slug}`}
                    className="flex gap-3 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <img
                      src={getBlogCoverImage(related.slug)}
                      alt=""
                      width={96}
                      height={72}
                      loading="lazy"
                      decoding="async"
                      className="h-[72px] w-24 shrink-0 object-cover"
                      aria-hidden="true"
                    />
                    <span className="flex items-center px-3 py-2 text-sm font-medium text-foreground">
                      {related.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <MedicalDisclaimer />
      </article>
    </AppShell>
  );
};

export default SeoLanding;
