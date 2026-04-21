import { CATEGORIES, type CategoryType, type SetupStep } from "@/lib/constants";
import type { SetupApproval } from "@/lib/hooks/useSetup";
import { useApproveStep } from "@/lib/hooks/useSetup";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApprovalStatus } from "./ApprovalStatus";

interface StepCategoriesProps {
  householdId: string;
  members: HouseholdMember[];
  approvals: SetupApproval[];
}

const STEP: SetupStep = "categories";

const unitLabels: Record<string, string> = {
  count: "Counted per occurrence",
  minutes: "Tracked in minutes",
  hours: "Tracked in hours",
};

const categoryIcons: Record<CategoryType, string> = {
  childcare: "child",
  household: "home",
  coverage: "clock",
};

function CategoryIcon({ type }: { type: CategoryType }) {
  const paths: Record<CategoryType, JSX.Element> = {
    childcare: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
      />
    ),
    household: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    ),
    coverage: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      {paths[type]}
    </svg>
  );
}

export function StepCategories({ householdId, members, approvals }: StepCategoriesProps) {
  const { user } = useAuth();
  const approveStep = useApproveStep();

  const alreadyApproved = approvals.some(
    (a) => a.step === STEP && a.user_id === user?.id
  );

  const handleApprove = () => {
    approveStep.mutate({ householdId, step: STEP });
  };

  const entries = Object.entries(CATEGORIES) as [CategoryType, typeof CATEGORIES[CategoryType]][];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bark">How we categorize labor</h2>
        <p className="text-sm text-sand-600 mt-1">
          Everything you log falls into one of three buckets. Both of you need to agree these
          definitions feel right before moving on.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map(([key, cat]) => (
          <Card key={key} className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                style={{ backgroundColor: cat.colorMuted + "30", color: cat.color }}
              >
                <CategoryIcon type={key} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-bark">{cat.label}</h3>
                <p className="text-sm text-sand-600 mt-0.5 leading-relaxed">
                  {cat.description}
                </p>
                <span
                  className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: cat.colorMuted + "25",
                    color: cat.color,
                  }}
                >
                  {unitLabels[cat.unit]}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-sand-50 space-y-3">
        <ApprovalStatus approvals={approvals} members={members} step={STEP} />

        {!alreadyApproved && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleApprove}
            disabled={approveStep.isPending}
          >
            {approveStep.isPending ? "Saving..." : "I agree to these definitions"}
          </Button>
        )}

        {alreadyApproved && (
          <p className="text-sm text-sage-600 text-center">
            You've approved. Waiting for your partner to review.
          </p>
        )}
      </Card>
    </div>
  );
}
