import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

const MedicalDisclaimer = ({ compact = false }: MedicalDisclaimerProps) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Se a dor piorar com qualquer exercício, <strong>PARE imediatamente</strong> e consulte um profissional de saúde.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="font-display font-semibold text-foreground">
            Aviso Importante
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este aplicativo oferece <strong>sugestões educativas</strong> de exercícios e{" "}
            <strong>não substitui</strong> a avaliação de um profissional de saúde. 
            Consulte um médico ou fisioterapeuta antes de iniciar qualquer programa de exercícios. 
            Se a dor piorar, <strong>PARE imediatamente</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
