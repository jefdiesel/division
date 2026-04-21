import { SETUP_STEPS, type SetupStep } from "@/lib/constants";
import { useSetupApprovals } from "@/lib/hooks/useSetup";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import { Spinner } from "@/components/ui/Spinner";
import { StepCategories } from "./StepCategories";
import { StepTasks } from "./StepTasks";
import { StepEdgeCases } from "./StepEdgeCases";
import { StepConfirm } from "./StepConfirm";

interface SetupWizardProps {
  householdId: string;
  members: HouseholdMember[];
}

const STEP_LABELS: Record<SetupStep, string> = {
  categories: "Categories",
  tasks: "Tasks",
  edge_cases: "Edge Cases",
  final: "Confirm",
};

/**
 * Determine the current step by finding the first step where both members
 * have NOT yet approved. Steps advance only when every member has approved.
 */
function getCurrentStep(
  approvals: { user_id: string; step: string }[],
  members: HouseholdMember[]
): SetupStep {
  for (const step of SETUP_STEPS) {
    const allApproved = members.every((m) =>
      approvals.some((a) => a.step === step && a.user_id === m.user_id)
    );
    if (!allApproved) return step;
  }
  // All steps approved -- stay on final (completion will redirect)
  return "final";
}

// ---------- Progress bar ----------

function ProgressIndicator({
  currentStep,
  approvals,
  members,
}: {
  currentStep: SetupStep;
  approvals: { user_id: string; step: string }[];
  members: HouseholdMember[];
}) {
  const currentIdx = SETUP_STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1">
      {SETUP_STEPS.map((step, i) => {
        const allApproved = members.every((m) =>
          approvals.some((a) => a.step === step && a.user_id === m.user_id)
        );
        const isCurrent = i === currentIdx;
        const isPast = i < currentIdx || allApproved;

        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`h-1.5 w-full rounded-full transition-all ${
                isPast
                  ? "bg-sage-400"
                  : isCurrent
                    ? "bg-warm-400"
                    : "bg-sand-200"
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-colors ${
                isPast
                  ? "text-sage-600"
                  : isCurrent
                    ? "text-bark"
                    : "text-sand-400"
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main wizard ----------

export function SetupWizard({ householdId, members }: SetupWizardProps) {
  const { data: approvals, isLoading } = useSetupApprovals(householdId);

  if (isLoading || !approvals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <Spinner />
      </div>
    );
  }

  const currentStep = getCurrentStep(approvals, members);

  const stepProps = {
    householdId,
    members,
    approvals,
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-bark">Setting up your household</h1>
          <p className="text-xs text-sand-500 mt-0.5">
            Step {SETUP_STEPS.indexOf(currentStep) + 1} of {SETUP_STEPS.length}
          </p>
        </div>

        {/* Progress */}
        <ProgressIndicator
          currentStep={currentStep}
          approvals={approvals}
          members={members}
        />

        {/* Active step */}
        {currentStep === "categories" && <StepCategories {...stepProps} />}
        {currentStep === "tasks" && <StepTasks {...stepProps} />}
        {currentStep === "edge_cases" && <StepEdgeCases {...stepProps} />}
        {currentStep === "final" && <StepConfirm {...stepProps} />}
      </div>
    </div>
  );
}
