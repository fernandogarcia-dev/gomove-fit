import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2, PlayCircle, Sparkles, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useReferral, REFERRAL_REWARD_DAYS } from "@/hooks/use-referral";
import { PRO_FEATURES, PRO_PRICING, type BillingInterval } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics/events";
import { useToast } from "@/hooks/use-toast";

const Pro = () => {
  const { user, session } = useAuth();
  const { data: subscription, isPro } = useSubscription();
  const { data: referral } = useReferral();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState(false);

  const checkoutStatus = searchParams.get("checkout");

  const handleSubscribe = async () => {
    if (!user || !session) {
      navigate("/login", { state: { from: "/pro" } });
      return;
    }

    trackEvent("checkout_start", { interval: billingInterval });
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ interval: billingInterval }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout unavailable");
      window.location.href = data.url;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not start checkout",
        description:
          error instanceof Error
            ? error.message
            : "Payments aren't fully configured yet — please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not open billing portal",
        description: error instanceof Error ? error.message : "Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferral = async () => {
    if (!referral) return;
    trackEvent("referral_share");
    try {
      await navigator.clipboard.writeText(referral.shareUrl);
      toast({ title: "Link copied!", description: "Share it with a friend to earn free PRO days." });
    } catch {
      toast({ variant: "destructive", title: "Could not copy link" });
    }
  };

  return (
    <AppShell title="GoMove PRO" showBack backTo="/">
      <div className="space-y-6">
        {checkoutStatus === "success" ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center text-sm font-medium text-primary">
            Payment received! It can take a few seconds to activate — refresh if needed.
          </div>
        ) : checkoutStatus === "cancelled" ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Checkout cancelled. No charge was made.
          </div>
        ) : null}

        <section className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            GoMove PRO
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground">
            The plan builder and exercise catalog are free. Forever.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            PRO just unlocks a few nice extras — like demonstration videos — and helps fund new
            exercises, features, and eventually the iOS/Android apps. No ads, no pressure, cancel
            anytime.
          </p>
        </section>

        {isPro ? (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="font-display text-lg font-semibold text-foreground">You're PRO! 🎉</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription.proUntil && subscription.status !== "active" && subscription.status !== "trialing"
                ? `Free PRO access active until ${new Date(subscription.proUntil).toLocaleDateString()}.`
                : subscription.currentPeriodEnd
                  ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`
                  : "Enjoy the demonstration videos and future perks."}
            </p>
            {subscription.status === "active" || subscription.status === "trialing" ? (
              <Button variant="outline" className="mt-4" onClick={handleManageSubscription} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage subscription
              </Button>
            ) : null}
          </section>
        ) : (
          <>
            <section className="space-y-3 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-primary" />
                <p className="font-medium">Demonstration video for every exercise</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={cn(
                    "rounded-lg py-2.5 text-sm font-medium transition-colors",
                    billingInterval === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
                  )}
                >
                  {PRO_PRICING.monthly.label}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={cn(
                    "rounded-lg py-2.5 text-sm font-medium transition-colors",
                    billingInterval === "yearly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
                  )}
                >
                  {PRO_PRICING.yearly.label}
                  <span className="ml-1 text-xs text-primary">save 33%</span>
                </button>
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleSubscribe} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Subscribe to PRO
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure checkout via Stripe. Cancel anytime, no questions asked.
              </p>
            </section>
          </>
        )}

        <section className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <p className="font-medium">Prefer not to pay? Invite friends instead.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Every friend who creates a GoMove account from your link gives you{" "}
            <strong>{REFERRAL_REWARD_DAYS} free days of PRO</strong> — no limit on how many.
          </p>
          {user && referral ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
                {referral.shareUrl}
              </code>
              <Button size="sm" onClick={handleCopyReferral}>
                Copy link
              </Button>
            </div>
          ) : (
            <Link to="/login" state={{ from: "/pro" }}>
              <Button size="sm" variant="outline">
                Sign in to get your invite link
              </Button>
            </Link>
          )}
          {referral && referral.referredCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {referral.referredCount} friend{referral.referredCount === 1 ? "" : "s"} joined so far 🎉
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
};

export default Pro;
