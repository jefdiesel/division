import type { SetupApproval } from "@/lib/hooks/useSetup";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import type { SetupStep } from "@/lib/constants";

interface ApprovalStatusProps {
  approvals: SetupApproval[];
  members: HouseholdMember[];
  step: SetupStep;
}

export function ApprovalStatus({ approvals, members, step }: ApprovalStatusProps) {
  const stepApprovals = approvals.filter((a) => a.step === step);

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const approved = stepApprovals.some((a) => a.user_id === member.user_id);
        return (
          <div
            key={member.id}
            className="flex items-center gap-2.5 text-sm"
          >
            {approved ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sage-100 text-sage-700">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sand-100">
                <span className="w-2 h-2 rounded-full bg-sand-300 animate-pulse" />
              </span>
            )}
            <span className={approved ? "text-sage-700 font-medium" : "text-sand-500"}>
              {member.display_name}
            </span>
            {approved ? (
              <span className="text-sage-600 text-xs">approved</span>
            ) : (
              <span className="text-sand-400 text-xs">waiting</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
