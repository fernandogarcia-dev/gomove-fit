import { Link } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import GoMoveLogo from "@/components/GoMoveLogo";

const Chat = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <GoMoveLogo variant="full" className="h-7" />
        </div>
      </header>

      <div className="container flex flex-1 flex-col py-6 max-w-2xl">
        <MedicalDisclaimer compact />
        
        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Vamos montar seu plano de exercícios!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            O chat com IA será ativado em breve. Conte sobre suas dores e vamos criar um plano personalizado para você.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
