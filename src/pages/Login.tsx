import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
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
import { BODY_REGIONS, DAYS_OF_WEEK, DIFFICULTIES, type BodyRegion, type Difficulty } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
  const [discomfortAreas, setDiscomfortAreas] = useState<BodyRegion[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<Difficulty | "">("");
  const [workoutDays, setWorkoutDays] = useState<number[]>([1, 3, 5]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
  const { toast } = useToast();

  const toggleDiscomfort = (value: BodyRegion) => {
    setDiscomfortAreas((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const toggleWorkoutDay = (value: number) => {
    setWorkoutDays((current) =>
      current.includes(value)
        ? current.filter((day) => day !== value)
        : [...current, value].sort((a, b) => a - b),
    );
  };

  const resetSignUpForm = () => {
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setPhone("");
    setDateOfBirth("");
    setGender("");
    setDiscomfortAreas([]);
    setFitnessLevel("");
    setWorkoutDays([1, 3, 5]);
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
        if (discomfortAreas.length === 0) {
          throw new Error("Select at least one area where you feel discomfort.");
        }
        if (!fitnessLevel) {
          throw new Error("Select your current fitness level.");
        }
        if (workoutDays.length === 0) {
          throw new Error("Select at least one day you can exercise.");
        }

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
              fitness_level: fitnessLevel,
              workout_days: workoutDays,
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
                  Your body & goals
                </h2>
                <div className="space-y-2">
                  <Label>Where do you feel discomfort? (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_REGIONS.map((item) => {
                      const selected = discomfortAreas.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleDiscomfort(item.value)}
                          className={cn(
                            "rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background",
                          )}
                        >
                          {selected ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fitness level</Label>
                  <Select
                    value={fitnessLevel}
                    onValueChange={(value) => setFitnessLevel(value as Difficulty)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How active are you today?" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Which days can you usually exercise?</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((item) => {
                      const selected = workoutDays.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleWorkoutDay(item.value)}
                          className={cn(
                            "min-w-[3.5rem] rounded-lg border-2 px-3 py-2 text-sm font-medium",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background",
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    })}
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
                    I agree to the Terms of Service and Privacy Policy.
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

          <Button type="submit" className="w-full" disabled={loading}>
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
