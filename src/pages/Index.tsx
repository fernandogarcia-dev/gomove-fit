import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Shield,
  ArrowRight,
  Home,
  Building2,
  Ban,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import SeoHead from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO_KEYWORDS } from "@/lib/seo/site";
import {
  faqJsonLd,
  organizationJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo/json-ld";

const features = [
  {
    icon: ClipboardList,
    title: "Answer a few questions",
    description:
      "Tell us where you feel discomfort, your level, and what equipment you have at home or in your building gym.",
  },
  {
    icon: Dumbbell,
    title: "Personalized home workout plan",
    description:
      "Get exercises tailored to your fitness level, available equipment, and time. No commercial gym required.",
  },
  {
    icon: CalendarDays,
    title: "Track your progress",
    description: "Save your plans, mark completed exercises, and see your weekly progress from anywhere in the US.",
  },
  {
    icon: Shield,
    title: "Safety first",
    description: "Every exercise includes contraindications and safety warnings for home and apartment training.",
  },
];

const useCases = [
  {
    icon: Home,
    title: "Pure home workouts",
    description: "Bodyweight exercises, stretches, and mobility in your living room. Zero equipment needed.",
  },
  {
    icon: Building2,
    title: "Apartment & condo gym",
    description: "Use your building fitness room with a plan that matches the dumbbells, bands, and machines you actually have.",
  },
  {
    icon: Ban,
    title: "No gym membership",
    description: "Skip the $50/month membership you barely use. Train on your schedule without commuting.",
  },
];

const HOME_FAQS = [
  {
    question: "Can I work out at home without going to a gym?",
    answer:
      "Yes. GoMove builds personalized home workout plans using bodyweight exercises, household items, resistance bands, dumbbells, chairs, or your apartment building gym. No commercial gym membership required.",
  },
  {
    question: "What equipment do I need for home workouts?",
    answer:
      "None is fine. GoMove supports no-equipment workouts, plus optional mat, resistance band, dumbbell, and chair. Select what you have and your plan adapts.",
  },
  {
    question: "Does GoMove work for apartment gym workouts?",
    answer:
      "Absolutely. Many Americans train in HOA or condo fitness rooms. Tell GoMove what equipment your building gym has and get a structured weekly routine.",
  },
  {
    question: "Is GoMove free?",
    answer:
      "Yes, you can build and save personalized exercise plans for free. GoMove PRO adds premium features like video demonstrations.",
  },
  {
    question: "Is this available in all US states?",
    answer:
      "Yes. GoMove is a web app available nationwide, from California to New York, Texas to Florida, and everywhere in between.",
  },
  {
    question: "Can home exercises help with neck, back, or joint pain?",
    answer:
      "Gentle stretching, mobility, and strength work often help mild discomfort, but GoMove is not medical treatment. Always consult a doctor or physical therapist for persistent pain.",
  },
];

const popularGuides = [
  { slug: "home-workouts", label: "Home workouts" },
  { slug: "workout-at-home-no-gym", label: "Workout at home no gym" },
  { slug: "apartment-gym-workout", label: "Apartment gym workout" },
  { slug: "no-equipment-workout", label: "No equipment workout" },
  { slug: "lower-back-pain-exercises-at-home", label: "Lower back pain exercises" },
  { slug: "work-from-home-exercises", label: "Work from home exercises" },
  { slug: "home-workout-california", label: "Home workout California" },
  { slug: "home-workout-texas", label: "Home workout Texas" },
];

const Index = () => {
  return (
    <AppShell>
      <SeoHead
        title="Home Workouts Without a Gym — Free Personalized Exercise Plans"
        description="GoMove helps Americans exercise at home without a gym. Free personalized workout plans using bodyweight, home equipment, or your apartment building gym. No membership required."
        path="/"
        keywords={[...SEO_KEYWORDS]}
        jsonLd={[organizationJsonLd(), webApplicationJsonLd(), faqJsonLd(HOME_FAQS)]}
      />

      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              #1 home workout app for Americans without a gym
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Exercise at home.{" "}
              <span className="text-primary">No gym membership required.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Personalized home workouts using what you already have: your body, a yoga mat, resistance
              bands, dumbbells, a chair, or the fitness room in your apartment building. Built for busy
              Americans who want to move without driving to a commercial gym.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/plan">
                <Button size="lg" className="gap-2 px-8 text-base font-semibold">
                  <ClipboardList className="h-5 w-5" />
                  Build my free home workout plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/exercises">
                <Button size="lg" variant="outline" className="px-8 text-base">
                  Browse home exercises
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
          Train wherever you live in the United States
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <useCase.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-sm font-semibold text-foreground">
                {useCase.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <MedicalDisclaimer />
      </section>

      <section className="pb-8">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          How GoMove home workouts work
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={false}
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

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
          Popular home workout guides
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Looking for a specific way to exercise at home? Browse our free guides for apartment gyms,
          no-equipment routines, pain relief, and all 50 US states.
        </p>
        <div className="flex flex-wrap gap-2">
          {popularGuides.map((guide) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              {guide.label}
            </Link>
          ))}
          <Link
            to="/guides"
            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
          >
            View all guides →
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
          Home workout FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQS.map((faq) => (
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

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <nav className="mb-4 flex flex-wrap justify-center gap-4 text-xs">
          <Link to="/guides" className="hover:text-foreground">
            Workout guides
          </Link>
          <Link to="/exercises" className="hover:text-foreground">
            Exercise catalog
          </Link>
          <Link to="/plan" className="hover:text-foreground">
            Build a plan
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} GoMove. All rights reserved.</p>
        <p className="mt-1">
          Free home workouts for Americans. Exercise at home, in your apartment gym, or with no equipment.
        </p>
        <p className="mt-1">
          This app does not replace professional evaluation. Consult a doctor or physical therapist.
        </p>
      </footer>
    </AppShell>
  );
};

export default Index;
