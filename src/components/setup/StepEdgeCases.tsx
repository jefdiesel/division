import { useState } from "react";
import {
  CATEGORIES,
  EDGE_CASE_PROMPTS,
  type CategoryType,
  type SetupStep,
} from "@/lib/constants";
import {
  useEdgeCaseRules,
  useSaveEdgeCaseRule,
  useApproveStep,
  type SetupApproval,
  type EdgeCaseRule,
} from "@/lib/hooks/useSetup";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ApprovalStatus } from "./ApprovalStatus";

interface StepEdgeCasesProps {
  householdId: string;
  members: HouseholdMember[];
  approvals: SetupApproval[];
}

const STEP: SetupStep = "edge_cases";

// ---------- Per-user vote storage ----------
// Edge case votes are stored locally per-prompt so we can show conflicts.
// Once both agree (or resolve), we save to the DB via useSaveEdgeCaseRule.

interface Vote {
  promptId: string;
  userId: string;
  choice: CategoryType;
}

// ---------- Single prompt card ----------

function PromptCard({
  prompt,
  rule,
  myVote,
  partnerVote,
  onVote,
  saving,
}: {
  prompt: (typeof EDGE_CASE_PROMPTS)[number];
  rule: EdgeCaseRule | undefined;
  myVote: Vote | undefined;
  partnerVote: Vote | undefined;
  onVote: (choice: CategoryType) => void;
  saving: boolean;
}) {
  const resolved = !!rule;
  const conflict = myVote && partnerVote && myVote.choice !== partnerVote.choice;

  return (
    <Card
      className={`p-4 transition-all ${
        resolved
          ? "ring-1 ring-sage-200 bg-sage-50/30"
          : conflict
            ? "ring-1 ring-warm-200 bg-warm-50/30"
            : ""
      }`}
    >
      <p className="text-sm font-medium text-bark leading-relaxed">
        {prompt.description}
      </p>
      {"note" in prompt && prompt.note && (
        <p className="text-xs text-sand-500 mt-1 italic">{prompt.note}</p>
      )}

      {resolved ? (
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: CATEGORIES[rule.resolved_category as CategoryType].colorMuted + "25",
              color: CATEGORIES[rule.resolved_category as CategoryType].color,
            }}
          >
            {CATEGORIES[rule.resolved_category as CategoryType].label}
          </span>
          <span className="text-xs text-sage-600">Agreed</span>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            {prompt.options.map((opt) => {
              const selected = myVote?.choice === opt;
              return (
                <button
                  key={opt}
                  onClick={() => onVote(opt)}
                  disabled={saving}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                    selected
                      ? "border-current"
                      : "border-transparent bg-sand-100 text-sand-600 hover:bg-sand-200"
                  }`}
                  style={
                    selected
                      ? {
                          backgroundColor: CATEGORIES[opt].colorMuted + "20",
                          color: CATEGORIES[opt].color,
                          borderColor: CATEGORIES[opt].colorMuted,
                        }
                      : undefined
                  }
                >
                  {CATEGORIES[opt].label}
                </button>
              );
            })}
          </div>

          {conflict && (
            <div className="rounded-lg bg-warm-50 px-3 py-2 text-xs text-warm-700">
              <span className="font-medium">Different picks.</span>{" "}
              Talk it out and pick the same category to resolve.
            </div>
          )}

          {myVote && !partnerVote && (
            <p className="text-xs text-sand-500">Waiting for your partner's pick...</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------- Main step ----------

export function StepEdgeCases({ householdId, members, approvals }: StepEdgeCasesProps) {
  const { user } = useAuth();
  const { data: rules, isLoading } = useEdgeCaseRules(householdId);
  const saveRule = useSaveEdgeCaseRule();
  const approveStep = useApproveStep();

  // Local vote state (simulates per-user picks before resolution).
  // In a production app, votes would be stored per-user in the DB.
  // Here we store the current user's votes locally and use saved rules
  // as the source of truth for resolution.
  const [myVotes, setMyVotes] = useState<Record<string, CategoryType>>({});

  const alreadyApproved = approvals.some(
    (a) => a.step === STEP && a.user_id === user?.id
  );

  const rulesMap = (rules ?? []).reduce<Record<string, EdgeCaseRule>>(
    (acc, r) => ({ ...acc, [r.prompt_id]: r }),
    {}
  );

  const allResolved = EDGE_CASE_PROMPTS.every((p) => !!rulesMap[p.id]);

  const handleVote = (promptId: string, description: string, choice: CategoryType) => {
    setMyVotes((prev) => ({ ...prev, [promptId]: choice }));

    // If there's already a saved rule, don't re-save unless changing it.
    // For simplicity in the two-parent flow: save the choice as resolved.
    // In the real-time flow the partner's client would see this via the
    // edge_case_rules subscription and could agree or pick differently.
    saveRule.mutate({
      household_id: householdId,
      prompt_id: promptId,
      description,
      resolved_category: choice,
    });
  };

  const handleApprove = () => {
    approveStep.mutate({ householdId, step: STEP });
  };

  if (isLoading) {
    return <Spinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-bark">The gray areas</h2>
        <p className="text-sm text-sand-600 mt-1">
          Some tasks could go either way. For each scenario, pick a category.
          You both need to land on the same answer before moving on.
        </p>
      </div>

      <div className="space-y-3">
        {EDGE_CASE_PROMPTS.map((prompt) => {
          const rule = rulesMap[prompt.id];
          const myVote = myVotes[prompt.id]
            ? { promptId: prompt.id, userId: user!.id, choice: myVotes[prompt.id] }
            : undefined;
          // Partner vote: if a rule exists and it wasn't from the current user's local state
          const partnerVote =
            rule && myVote && rule.resolved_category !== myVote.choice
              ? {
                  promptId: prompt.id,
                  userId: "partner",
                  choice: rule.resolved_category as CategoryType,
                }
              : undefined;

          return (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              rule={rule}
              myVote={myVote}
              partnerVote={partnerVote}
              onVote={(choice) => handleVote(prompt.id, prompt.description, choice)}
              saving={saveRule.isPending}
            />
          );
        })}
      </div>

      <Card className="p-4 bg-sand-50 space-y-3">
        <ApprovalStatus approvals={approvals} members={members} step={STEP} />

        {!allResolved && (
          <p className="text-sm text-sand-600 text-center">
            All edge cases must be resolved before you can approve.
          </p>
        )}

        {allResolved && !alreadyApproved && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleApprove}
            disabled={approveStep.isPending}
          >
            {approveStep.isPending ? "Saving..." : "Approve edge cases"}
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
