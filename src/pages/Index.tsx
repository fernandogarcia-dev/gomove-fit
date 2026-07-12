import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ClipboardList, Dumbbell, Shield, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ClipboardList,
    title: "Answer a few questions",
    description: "Tell us where you feel discomfort, your level, and what equipment you have at home.",
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
    <AppShell>
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Personalized exercise plans
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Relieve pain with{" "}
              <span className="text-primary">personalized exercises</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Answer a short questionnaire and receive a weekly exercise plan adapted to your body,
              equipment, and routine.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/plan">
                <Button size="lg" className="gap-2 px-8 text-base font-semibold">
                  <ClipboardList className="h-5 w-5" />
                  Build my plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/exercises">
                <Button size="lg" variant="outline" className="px-8 text-base">
                  Browse exercises
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mb-12">
        <MedicalDisclaimer />
      </section>

      <section className="pb-8">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-display font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} GoMove. All rights reserved.</p>
        <p className="mt-1">
          This app does not replace professional evaluation. Consult a doctor or physical therapist.
        </p>
      </footer>
    </AppShell>
  );
};

export default Index;
