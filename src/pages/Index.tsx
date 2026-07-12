import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Dumbbell, CalendarDays, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import AdBanner from "@/components/AdBanner";
import GoMoveLogo from "@/components/GoMoveLogo";

const features = [
  {
    icon: MessageCircle,
    title: "Tell us how you feel",
    description: "Chat with our AI about your pain and discomfort. It will understand your situation.",
  },
  {
    icon: Dumbbell,
    title: "Personalized plan",
    description: "Get exercises tailored to your fitness level, equipment, and available time.",
  },
  {
    icon: CalendarDays,
    title: "Track your progress",
    description: "Save your plans, mark completed exercises, and see your weekly progress.",
  },
  {
    icon: Shield,
    title: "Safety first",
    description: "Every exercise includes contraindications and safety warnings.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <GoMoveLogo variant="full" className="h-9" />

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              AI-guided exercise plans
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight">
              Relieve pain with{" "}
              <span className="text-primary">personalized exercises</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Tell our AI what you are feeling and receive a weekly exercise plan
              adapted to your body, equipment, and routine.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/chat">
                <Button size="lg" className="gap-2 px-8 text-base font-semibold">
                  <MessageCircle className="h-5 w-5" />
                  Start conversation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <AdBanner className="container mb-12" slot="hero" label="Ad space — Main banner" />

      {/* Disclaimer */}
      <section className="container mb-16">
        <MedicalDisclaimer />
      </section>

      {/* Features */}
      <section className="container pb-20">
        <h2 className="font-display text-2xl font-bold text-center text-foreground mb-12">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <AdBanner className="container mb-16" slot="secondary" label="Ad space — Secondary banner" />

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GoMove. All rights reserved.</p>
          <p className="mt-1">
            This app does not replace professional evaluation. Consult a doctor or physical therapist.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
