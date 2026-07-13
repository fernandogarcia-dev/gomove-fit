import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getLandingPage, LANDING_PAGE_MAP } from "@/lib/seo/landing-pages";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import NotFound from "@/pages/NotFound";

const SeoLanding = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const page = getLandingPage(slug);

  if (!page) {
    return <NotFound />;
  }

  const path = `/guides/${page.slug}`;
  const relatedPages = page.relatedSlugs
    .map((relatedSlug) => LANDING_PAGE_MAP.get(relatedSlug))
    .filter((related): related is NonNullable<typeof related> => Boolean(related));

  return (
    <AppShell showBack backTo="/guides" title="Guide">
      <SeoHead
        title={page.title}
        description={page.metaDescription}
        path={path}
        keywords={page.keywords}
        jsonLd={[
          articleJsonLd({
            title: page.title,
            description: page.metaDescription,
            path,
            keywords: page.keywords,
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
        <p className="text-sm font-medium text-primary">Free home workout guide</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {page.h1}
        </h1>
        <p className="text-lg text-muted-foreground">{page.heroSubtitle}</p>

        <div className="not-prose my-8">
          <Link to="/plan">
            <Button size="lg" className="gap-2 font-semibold">
              Build my free plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {page.sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
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

        {relatedPages.length > 0 ? (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-foreground">Related guides</h2>
            <ul className="not-prose grid gap-2 sm:grid-cols-2">
              {relatedPages.map((related) => (
                <li key={related.slug}>
                  <Link
                    to={`/guides/${related.slug}`}
                    className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {related.title}
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
