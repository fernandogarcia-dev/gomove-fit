import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import SeoHead from "@/components/SeoHead";
import AdSlot from "@/components/ads/AdSlot";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { Button } from "@/components/ui/button";
import {
  FEATURED_BLOG_SLUGS,
  getBlogCoverUrl,
} from "@/lib/seo/blog-meta";
import { GUIDE_CATEGORIES } from "@/lib/seo/landing-pages";
import { fetchPublishedGuides, getAllStaticLandingPages } from "@/lib/guides";
import { blogListingJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

const Guides = () => {
  const staticGuides = getAllStaticLandingPages();

  const { data: guides = staticGuides } = useQuery({
    queryKey: ["published-guides"],
    queryFn: fetchPublishedGuides,
    initialData: staticGuides,
    staleTime: 5 * 60 * 1000,
  });

  const guideMap = new Map(guides.map((page) => [page.slug, page]));

  const featuredPages = FEATURED_BLOG_SLUGS.map((slug) => guideMap.get(slug)).filter(
    (page): page is NonNullable<typeof page> => Boolean(page),
  );

  const listingPosts = featuredPages.map((page) => ({
    title: page.title,
    path: `/guides/${page.slug}`,
    image: getBlogCoverUrl(page.slug),
  }));

  return (
    <AppShell title="Guides" wide>
      <SeoHead
        title="Home Workout Blog & Guides — Exercise at Home Without a Gym"
        description="GoMove blog: free home workout guides, apartment gym tips, no-equipment routines, pain relief exercises, and state-by-state fitness articles for Americans."
        path="/guides"
        keywords={[
          "home workout blog",
          "home workout guides",
          "exercise at home articles",
          "apartment gym workout guide",
          "no gym fitness blog",
          "USA home exercise resources",
        ]}
        jsonLd={[
          blogListingJsonLd(listingPosts),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />

      <div className="space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">GoMove Blog</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Home workout guides for every American lifestyle
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Expert articles on exercising at home, training in your apartment gym, building strength with
            zero equipment, and finding routines that fit your state, schedule, and body.
          </p>
          <Link to="/plan" className="inline-block">
            <Button size="lg" className="gap-2 font-semibold">
              Build my personalized plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        <AdSlot placement="blog-hub-top" variant="banner" />

        {featuredPages.length > 0 ? (
          <section aria-labelledby="featured-guides-heading">
            <h2 id="featured-guides-heading" className="mb-4 font-display text-xl font-bold text-foreground">
              Featured articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredPages.map((page, index) => (
                <BlogPostCard key={page.slug} page={page} featured={index === 0} />
              ))}
            </div>
          </section>
        ) : null}

        <AdSlot placement="blog-hub-mid" variant="rectangle" />

        {GUIDE_CATEGORIES.map((category, categoryIndex) => (
          <section key={category.title} aria-labelledby={`category-${categoryIndex}`}>
            <h2
              id={`category-${categoryIndex}`}
              className="mb-4 font-display text-xl font-bold text-foreground"
            >
              {category.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {category.slugs.map((slug) => {
                const page = guideMap.get(slug);
                if (!page) return null;
                return <BlogPostCard key={slug} page={page} />;
              })}
            </div>
            {categoryIndex % 2 === 1 ? (
              <AdSlot placement="blog-hub-feed" variant="in-feed" className="mt-6" />
            ) : null}
          </section>
        ))}

        <footer className="rounded-xl border border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          <p>
            Every guide links to our free plan builder.{" "}
            <Link to="/plan" className="font-medium text-primary hover:underline">
              Get your personalized home workout in 2 minutes
            </Link>
            .
          </p>
          <p className="mt-2 text-xs">
            Updated regularly · {guides.length} articles · Nationwide USA
          </p>
        </footer>
      </div>
    </AppShell>
  );
};

export default Guides;
