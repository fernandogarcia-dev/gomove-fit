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
          If pain worsens during any exercise, <strong>STOP immediately</strong> and consult a healthcare professional.
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
            Important Notice
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This app provides <strong>educational exercise suggestions</strong> and{" "}
            <strong>does not replace</strong> evaluation by a healthcare professional.
            Consult a doctor or physical therapist before starting any exercise program.
            If pain worsens, <strong>STOP immediately</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
