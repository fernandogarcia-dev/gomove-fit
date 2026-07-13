import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoMoveLogo from "@/components/GoMoveLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics/events";
import { clearStoredReferralCode, getStoredReferralCode } from "@/lib/referral";
import { cn } from "@/lib/utils";
import { loadPendingPlan, savePendingPlan, type PendingPlan } from "@/lib/pending-plan";
import { PendingPlanCard, PlanWizardDialog } from "@/components/plan/PendingPlanCard";

const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign-up profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PendingPlan | null>(() => loadPendingPlan());
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
  const { toast } = useToast();

  const refreshPendingPlan = () => setPendingPlan(loadPendingPlan());

  const canCreateAccount = useMemo(
    () => acceptTerms && acceptDisclaimer && Boolean(pendingPlan?.plan.preferences),
    [acceptTerms, acceptDisclaimer, pendingPlan],
  );

  const resetSignUpForm = () => {
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setPhone("");
    setDateOfBirth("");
    setGender("");
    setAcceptTerms(false);
    setAcceptDisclaimer(false);
    setMarketingOptIn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (!acceptTerms || !acceptDisclaimer) {
          throw new Error("Please accept the terms and medical disclaimer to continue.");
        }
        if (!pendingPlan?.plan.preferences) {
          throw new Error("Build your personalized plan before creating your account.");
        }

        const prefs = pendingPlan.plan.preferences;
        const discomfortAreas =
          pendingPlan.bodyRegions.length > 0 ? pendingPlan.bodyRegions : prefs.bodyRegions;

        const referralCode = getStoredReferralCode();
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim() || null,
              date_of_birth: dateOfBirth || null,
              gender: gender || null,
              discomfort_areas: discomfortAreas,
              fitness_level: prefs.difficulty,
              workout_days: prefs.daysPerWeek,
              marketing_opt_in: marketingOptIn,
              referral_code: referralCode ?? undefined,
            },
          },
        });
        if (error) throw error;
        clearStoredReferralCode();
        trackEvent("sign_up", { method: "email" });

        if (data.user && fullName) {
          await supabase
            .from("profiles")
            .update({ display_name: fullName })
            .eq("user_id", data.user.id);
        }

        if (data.session) {
          toast({ title: "Welcome to GoMove!", description: "Your account is ready." });
          navigate(redirectTo);
          return;
        }

        toast({
          title: "Account created!",
          description:
            "Check your email to confirm your account. You can still build plans without signing in.",
        });
        resetSignUpForm();
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        trackEvent("login", { method: "email" });
        navigate(redirectTo);
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className={cn("w-full space-y-6", isSignUp ? "max-w-lg" : "max-w-sm")}>
        <div className="text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Back</span>
          </Link>
          <div className="mb-4 flex justify-center">
            <GoMoveLogo variant="icon" to={undefined} className="h-12 w-12" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isSignUp ? "Create your GoMove account" : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp
              ? "Tell us about yourself so we can personalize your experience from day one."
              : "Sign in to save plans and track progress"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp ? (
            <>
              {pendingPlan ? (
                <PendingPlanCard pending={pendingPlan} onUpdated={refreshPendingPlan} />
              ) : (
                <section className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-medium text-foreground">Build your personalized plan</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Answer a few quick questions to create your weekly exercise plan before
                          you finish signup.
                        </p>
                      </div>
                      <PlanWizardDialog
                        open={planDialogOpen}
                        onOpenChange={setPlanDialogOpen}
                        title="Build your plan"
                        submitLabel="Save plan"
                        trigger={
                          <Button type="button" variant="outline" size="sm">
                            Build my plan
                          </Button>
                        }
                        onComplete={(plan, bodyRegions) => {
                          savePendingPlan({ plan, bodyRegions });
                          refreshPendingPlan();
                          toast({
                            title: "Plan created",
                            description: "Finish signup to save it to your account.",
                          });
                        }}
                      />
                    </div>
                  </div>
                </section>
              )}

              <section className="space-y-3 rounded-xl border border-border bg-card p-4">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  About you
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-border bg-card p-4">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Account security
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="disclaimer"
                    checked={acceptDisclaimer}
                    onCheckedChange={(checked) => setAcceptDisclaimer(checked === true)}
                  />
                  <Label htmlFor="disclaimer" className="text-sm leading-relaxed">
                    I understand GoMove provides educational exercise suggestions only and does not
                    replace a doctor or physical therapist. I will stop if pain worsens.
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary underline-offset-2 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="marketing"
                    checked={marketingOptIn}
                    onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                  />
                  <Label htmlFor="marketing" className="text-sm leading-relaxed text-muted-foreground">
                    Send me tips, new exercises, and GoMove updates (optional).
                  </Label>
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (isSignUp && !canCreateAccount)}
          >
            {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              if (isSignUp) resetSignUpForm();
            }}
            className="font-medium text-primary hover:underline"
          >
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
