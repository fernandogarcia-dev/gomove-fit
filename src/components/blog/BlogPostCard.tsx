import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import type { SeoLandingPage } from "@/lib/seo/landing-pages";
import {
  estimateReadTimeMinutes,
  formatBlogDate,
  getBlogCategoryForSlug,
  getBlogCoverAlt,
  getBlogCoverImage,
  getPublishedDate,
} from "@/lib/seo/blog-meta";
import { cn } from "@/lib/utils";

type BlogPostCardProps = {
  page: SeoLandingPage;
  featured?: boolean;
  className?: string;
};

const BlogPostCard = ({ page, featured = false, className }: BlogPostCardProps) => {
  const category = getBlogCategoryForSlug(page.slug);
  const readTime = estimateReadTimeMinutes(page);
  const published = formatBlogDate(getPublishedDate(page.slug));

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        featured && "sm:col-span-2",
        className,
      )}
    >
      <Link to={`/guides/${page.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-muted", featured ? "aspect-[2/1]" : "aspect-[16/10]")}>
          <img
            src={getBlogCoverImage(page.slug)}
            alt={getBlogCoverAlt(page.slug, page)}
            width={800}
            height={featured ? 400 : 500}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary backdrop-blur-sm">
            {category.title.split(" ")[0]}
          </span>
        </div>
        <div className="p-4">
          <h3
            className={cn(
              "font-display font-bold leading-snug text-foreground group-hover:text-primary",
              featured ? "text-lg sm:text-xl" : "text-sm sm:text-base",
            )}
          >
            {page.h1}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {page.metaDescription}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <time dateTime={getPublishedDate(page.slug)}>{published}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {readTime} min read
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogPostCard;
