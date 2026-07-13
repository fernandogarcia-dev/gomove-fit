import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { GUIDE_CATEGORIES, LANDING_PAGE_MAP } from "@/lib/seo/landing-pages";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

const Guides = () => {
  return (
    <AppShell showBack backTo="/" title="Guides">
      <SeoHead
        title="Home Workout Guides — Exercise at Home Without a Gym"
        description="Free guides for home workouts, apartment gym training, no-equipment routines, pain relief exercises, and state-by-state fitness plans across the United States."
        path="/guides"
        keywords={[
          "home workout guides",
          "exercise at home guides",
          "apartment gym workout guide",
          "no gym fitness guides",
          "USA home exercise resources",
        ]}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />

      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Home workout guides for every American lifestyle
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Exercise at home, in your apartment gym, or with zero equipment. Browse guides by goal,
            body area, equipment, or your US state.
          </p>
          <Link to="/plan" className="mt-6 inline-block">
            <Button size="lg" className="gap-2 font-semibold">
              Build my personalized plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        {GUIDE_CATEGORIES.map((category) => (
          <section key={category.title}>
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">{category.title}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {category.slugs.map((slug) => {
                const page = LANDING_PAGE_MAP.get(slug);
                if (!page) return null;
                return (
                  <li key={slug}>
                    <Link
                      to={`/guides/${slug}`}
                      className="block rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="font-medium text-foreground">{page.h1}</span>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {page.metaDescription}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
};

export default Guides;
