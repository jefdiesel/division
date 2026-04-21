import { useEffect, useRef } from "react";
import { CATEGORIES, type CategoryType, type SetupStep } from "@/lib/constants";
import { formatDollars } from "@/lib/constants";
import { useTaskTemplates, type TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import {
  useEdgeCaseRules,
  useApproveStep,
  useCompleteSetup,
  type SetupApproval,
} from "@/lib/hooks/useSetup";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ApprovalStatus } from "./ApprovalStatus";

interface StepConfirmProps {
  householdId: string;
  members: HouseholdMember[];
  approvals: SetupApproval[];
}

const STEP: SetupStep = "final";

export function StepConfirm({ householdId, members, approvals }: StepConfirmProps) {
  const { user } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTaskTemplates(householdId);
  const { data: rules, isLoading: rulesLoading } = useEdgeCaseRules(householdId);
  const approveStep = useApproveStep();
  const completeSetup = useCompleteSetup();

  const alreadyApproved = approvals.some(
    (a) => a.step === STEP && a.user_id === user?.id
  );

  const bothApproved =
    members.length > 0 &&
    members.every((m) =>
      approvals.some((a) => a.step === STEP && a.user_id === m.user_id)
    );

  const handleApprove = async () => {
    await approveStep.mutateAsync({ householdId, step: STEP });

    // Check if both have now approved (including the one we just added)
    const otherApproved = approvals.some(
      (a) => a.step === STEP && a.user_id !== user?.id
    );
    if (otherApproved) {
      completeSetup.mutate(householdId);
    }
  };

  // If the other parent approved first and this is a realtime update
  // showing both approved, complete setup automatically.
  const completing = useRef(false);
  useEffect(() => {
    if (bothApproved && !completing.current) {
      completing.current = true;
      completeSetup.mutate(householdId);
    }
  }, [bothApproved, householdId, completeSetup]);

  if (tasksLoading || rulesLoading) {
    return <Spinner className="py-12" />;
  }

  // Group tasks by category
  const grouped = (tasks ?? []).reduce<Record<CategoryType, TaskTemplate[]>>(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<CategoryType, TaskTemplate[]>
  );

  const categoryOrder: CategoryType[] = ["childcare", "household", "coverage"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-bark">Everything look right?</h2>
        <p className="text-sm text-sand-600 mt-1">
          Here's the full picture of what you've agreed on. Once both of you approve,
          logging begins.
        </p>
      </div>

      {/* Active tasks summary */}
      {categoryOrder.map((cat) => {
        const catTasks = grouped[cat] ?? [];
        if (catTasks.length === 0) return null;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORIES[cat].color }}
              />
              <h3 className="text-sm font-semibold text-bark">
                {CATEGORIES[cat].label}
              </h3>
              <span className="text-xs text-sand-400">
                {catTasks.length} task{catTasks.length !== 1 && "s"}
              </span>
            </div>
            <Card className="divide-y divide-sand-100">
              {catTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-base w-6 text-center shrink-0">
                    {task.icon || "~"}
                  </span>
                  <span className="text-sm text-bark flex-1 min-w-0 truncate">
                    {task.name}
                  </span>
                  {task.category === "household" && task.market_rate_usd_hr != null && (
                    <span className="text-xs text-sand-500 shrink-0">
                      {formatDollars(task.market_rate_usd_hr)}/hr
                    </span>
                  )}
                </div>
              ))}
            </Card>
          </div>
        );
      })}

      {/* Edge case rulings */}
      {(rules ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-bark mb-2">Edge case rulings</h3>
          <Card className="divide-y divide-sand-100">
            {(rules ?? []).map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-sm text-bark flex-1 min-w-0">
                  {rule.description}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORIES[rule.resolved_category as CategoryType]?.colorMuted + "25",
                    color:
                      CATEGORIES[rule.resolved_category as CategoryType]?.color,
                  }}
                >
                  {CATEGORIES[rule.resolved_category as CategoryType]?.label}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Dispute rule */}
      <Card className="p-4 bg-warm-50/50 border border-warm-100">
        <h3 className="text-sm font-semibold text-bark mb-1">Dispute rule</h3>
        <p className="text-sm text-sand-700 leading-relaxed">
          Flagged entries stay in the data, are marked as contested, and both parties see
          the flag. No data is deleted during a dispute.
        </p>
      </Card>

      {/* Approval footer */}
      <Card className="p-4 bg-sand-50 space-y-3">
        <ApprovalStatus approvals={approvals} members={members} step={STEP} />

        {!alreadyApproved && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleApprove}
            disabled={approveStep.isPending || completeSetup.isPending}
          >
            {approveStep.isPending || completeSetup.isPending
              ? "Saving..."
              : "Approve and start logging"}
          </Button>
        )}

        {alreadyApproved && !bothApproved && (
          <p className="text-sm text-sage-600 text-center">
            You've approved. Waiting for your partner to review.
          </p>
        )}

        {bothApproved && (
          <p className="text-sm text-sage-700 font-medium text-center">
            Setup complete! Redirecting...
          </p>
        )}
      </Card>
    </div>
  );
}
