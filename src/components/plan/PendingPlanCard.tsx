import { useState } from "react";
import { ClipboardList, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlanWizard, summarizePlan } from "@/components/plan/PlanWizard";
import { useExercises } from "@/hooks/use-exercises";
import { savePendingPlan, type PendingPlan } from "@/lib/pending-plan";
import type { BodyRegion } from "@/lib/constants";
import type { PlanData } from "@/lib/plan-builder";

type PendingPlanCardProps = {
  pending: PendingPlan;
  onUpdated: () => void;
};

export const PendingPlanCard = ({ pending, onUpdated }: PendingPlanCardProps) => {
  const summary = summarizePlan(pending.plan, pending.bodyRegions);

  return (
    <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-foreground">Your plan is already created</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.regionsLabel} · {summary.timeLabel} · {summary.totalSessions} sessions ·{" "}
            {summary.totalExercises} exercises
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Finish creating your account to save it. You can edit the plan before signing up.
          </p>
        </div>
      </div>
      <PlanWizardDialog
        title="Edit your plan"
        initial={{ bodyRegions: pending.bodyRegions, plan: pending.plan }}
        trigger={
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-4 w-4" />
            Edit plan
          </Button>
        }
        onComplete={(plan, bodyRegions) => {
          savePendingPlan({ plan, bodyRegions });
          onUpdated();
        }}
      />
    </section>
  );
};

type PlanWizardDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  initial?: {
    bodyRegions?: BodyRegion[];
    plan?: PlanData | null;
  };
  submitLabel?: string;
  onComplete: (plan: PlanData, bodyRegions: BodyRegion[]) => void;
};

export const PlanWizardDialog = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  title,
  initial,
  submitLabel,
  onComplete,
}: PlanWizardDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
  const { data: exercises = [], isLoading, isError } = useExercises();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PlanWizard
          exercises={exercises}
          exercisesLoading={isLoading}
          exercisesError={isError}
          initial={initial}
          submitLabel={submitLabel}
          onComplete={(plan, bodyRegions) => {
            onComplete(plan, bodyRegions);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
