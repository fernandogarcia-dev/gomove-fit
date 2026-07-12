import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Dumbbell, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProComingSoonProps = {
  variant?: "page" | "inline";
  className?: string;
};

const ProComingSoon = ({ variant = "page", className }: ProComingSoonProps) => {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5 text-center",
          className,
        )}
      >
        <PlayCircle className="h-8 w-8 text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Demonstration videos coming soon</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We are preparing step-by-step videos to make every exercise easier to follow. Check back
            soon — the free plan builder and exercise catalog are ready for you today.
          </p>
        </div>
        <Link to="/pro">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            About GoMove PRO
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <section className="text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Coming soon
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          GoMove PRO is almost here
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          We are preparing demonstration videos for every exercise so your experience feels clearer,
          safer, and more motivating. PRO is not available for purchase yet — come back soon to try it.
        </p>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <PlayCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1 text-left">
            <p className="font-medium text-foreground">What we are building</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Short, professional videos showing correct form, common mistakes, and modifications for
              each movement in the catalog. We want PRO to feel like a real upgrade — not a paywall on
              basics you already deserve for free.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <p className="font-display text-lg font-semibold text-foreground">
          Everything important stays free
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You can still build personalized plans, browse the full exercise library, save your routines,
          and track progress at no cost. Do not wait for PRO — start moving today and we will notify you
          when videos are ready.
        </p>
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Link to="/plan" className="flex-1">
            <Button className="w-full gap-2" size="lg">
              <ClipboardList className="h-4 w-4" />
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/exercises" className="flex-1">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Dumbbell className="h-4 w-4" />
              Browse exercises
            </Button>
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Thank you for your patience. We are working hard to make GoMove worth coming back to.
      </p>
    </div>
  );
};

export default ProComingSoon;
