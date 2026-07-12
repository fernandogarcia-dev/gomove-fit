import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Dumbbell, CalendarDays, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import AdBanner from "@/components/AdBanner";
import GoogleTranslate from "@/components/GoogleTranslate";
import GoMoveLogo from "@/components/GoMoveLogo";

const features = [
  {
    icon: MessageCircle,
    title: "Conte como se sente",
    description: "Converse com nossa IA sobre suas dores e desconfortos. Ela vai entender seu caso.",
  },
  {
    icon: Dumbbell,
    title: "Plano personalizado",
    description: "Receba exercícios adequados ao seu nível, equipamentos e tempo disponível.",
  },
  {
    icon: CalendarDays,
    title: "Acompanhe seu progresso",
    description: "Salve seus planos, marque exercícios feitos e veja sua evolução semanal.",
  },
  {
    icon: Shield,
    title: "Segurança em primeiro lugar",
    description: "Todos os exercícios incluem contraindicações e alertas de segurança.",
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
            <GoogleTranslate />
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
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
              Exercícios guiados por IA
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight">
              Alivie suas dores com{" "}
              <span className="text-primary">exercícios personalizados</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Conte para nossa inteligência artificial o que você está sentindo e receba um plano semanal 
              de exercícios adaptado ao seu corpo, equipamentos e rotina.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/chat">
                <Button size="lg" className="gap-2 px-8 text-base font-semibold">
                  <MessageCircle className="h-5 w-5" />
                  Iniciar conversa
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <AdBanner className="container mb-12" label="Espaço para anúncio — Banner principal" />

      {/* Disclaimer */}
      <section className="container mb-16">
        <MedicalDisclaimer />
      </section>

      {/* Features */}
      <section className="container pb-20">
        <h2 className="font-display text-2xl font-bold text-center text-foreground mb-12">
          Como funciona
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

      <AdBanner className="container mb-16" label="Espaço para anúncio — Banner secundário" />

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GoMove. Todos os direitos reservados.</p>
          <p className="mt-1">
            Este app não substitui avaliação profissional. Consulte um médico ou fisioterapeuta.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
