import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PlanData } from "@/lib/plan-builder";
import { useQuery } from "@tanstack/react-query";

const MyPlansContent = () => {
  const { user } = useAuth();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["saved-plans", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell title="My plans">
      <div className="space-y-4">
        <Link to="/plan">
          <Button className="w-full">Create a new plan</Button>
        </Link>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your plans...</p>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No saved plans yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Build a plan and save it to track your weekly progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const planData = plan.plan_data as PlanData;
              const sessionCount = planData?.schedule?.length ?? 0;
              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {sessionCount} session{sessionCount === 1 ? "" : "s"} per week
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

const MyPlans = () => (
  <ProtectedRoute>
    <MyPlansContent />
  </ProtectedRoute>
);

export default MyPlans;
