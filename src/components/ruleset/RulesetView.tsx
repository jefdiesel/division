import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { useTaskTemplates, type TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import { useEdgeCaseRules } from "@/lib/hooks/useSetup";
import { CATEGORIES, formatDuration, type CategoryType } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

interface ChangeRequest {
  id: string;
  household_id: string;
  proposed_by: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

function TaskRow({ task }: { task: TaskTemplate }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-sand-100 last:border-b-0">
      <span className="text-lg" role="img" aria-label={task.name}>
        {task.icon || "\u2022"}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-bark">{task.name}</span>
      </div>
      <div className="text-xs text-sand-500 text-right">
        {task.default_value != null && (
          <span>{formatDuration(task.default_value, task.unit)} default</span>
        )}
      </div>
    </div>
  );
}

function ProposeChangeForm({
  householdId,
  onClose,
}: {
  householdId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || !user) return;
    setSubmitting(true);
    try {
      await supabase.from("ruleset_change_requests").insert({
        household_id: householdId,
        proposed_by: user.id,
        description: description.trim(),
        status: "pending",
      });
      onClose();
    } catch {
      // Allow the user to try again
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mt-3">
      <h4 className="text-sm font-semibold text-bark mb-2">Propose a change</h4>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the change you'd like to make to the shared rules..."
        className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-200 text-bark text-sm focus:outline-none focus:ring-2 focus:ring-warm-400/40 focus:border-warm-400 transition-all placeholder:text-sand-400 resize-none"
        rows={3}
      />
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!description.trim() || submitting}
        >
          {submitting ? "Sending..." : "Submit"}
        </Button>
      </div>
    </Card>
  );
}

function ChangeRequestRow({
  request,
  memberMap,
  isOwnRequest,
  onApprove,
  onReject,
}: {
  request: ChangeRequest;
  memberMap: Record<string, string>;
  isOwnRequest: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="py-3 border-b border-sand-100 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-bark">{request.description}</p>
          <p className="text-[11px] text-sand-500 mt-0.5">
            Proposed by {memberMap[request.proposed_by] ?? "Unknown"}{" "}
            {new Date(request.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        {request.status === "pending" && !isOwnRequest && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(request.id)}
            >
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(request.id)}
            >
              Reject
            </Button>
          </div>
        )}
        {request.status === "pending" && isOwnRequest && (
          <span className="text-[11px] text-sand-400 shrink-0">
            Waiting for response
          </span>
        )}
        {request.status === "approved" && (
          <span className="text-[11px] text-sage-600 shrink-0">Approved</span>
        )}
        {request.status === "rejected" && (
          <span className="text-[11px] text-sand-500 shrink-0">Rejected</span>
        )}
      </div>
    </div>
  );
}

export function RulesetView() {
  const { user } = useAuth();
  const { data: householdData } = useHousehold();
  const household = householdData?.household;
  const members = householdData?.members ?? [];
  const householdId = household?.id;

  const { data: tasks, isLoading: tasksLoading } = useTaskTemplates(householdId);
  const { data: edgeCaseRules, isLoading: rulesLoading } =
    useEdgeCaseRules(householdId);

  const [showPropose, setShowPropose] = useState(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);

  // Load change requests
  useMemo(() => {
    if (!householdId || requestsLoaded) return;
    supabase
      .from("ruleset_change_requests")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setChangeRequests(data as ChangeRequest[]);
        setRequestsLoaded(true);
      });
  }, [householdId, requestsLoaded]);

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      map[m.user_id] = m.display_name;
    }
    return map;
  }, [members]);

  const tasksByCategory = useMemo(() => {
    const grouped: Record<CategoryType, TaskTemplate[]> = {
      childcare: [],
      household: [],
      coverage: [],
    };
    for (const task of tasks ?? []) {
      if (grouped[task.category]) {
        grouped[task.category].push(task);
      }
    }
    return grouped;
  }, [tasks]);

  const handleApproveRequest = async (id: string) => {
    await supabase
      .from("ruleset_change_requests")
      .update({ status: "approved" })
      .eq("id", id);
    setChangeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
    );
  };

  const handleRejectRequest = async (id: string) => {
    await supabase
      .from("ruleset_change_requests")
      .update({ status: "rejected" })
      .eq("id", id);
    setChangeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
  };

  if (!householdId || !user) {
    return <Spinner className="py-20" />;
  }

  const isLoading = tasksLoading || rulesLoading;

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-bark">Shared Rules</h1>
          <p className="text-sm text-sand-600 mt-0.5">
            The agreed-upon tasks and categorization.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowPropose(!showPropose)}
        >
          Propose change
        </Button>
      </div>

      {showPropose && (
        <ProposeChangeForm
          householdId={householdId}
          onClose={() => {
            setShowPropose(false);
            setRequestsLoaded(false); // Refresh
          }}
        />
      )}

      {isLoading ? (
        <Spinner className="py-12" />
      ) : (
        <div className="space-y-4 mt-2">
          {/* Tasks grouped by category */}
          {(["childcare", "household", "coverage"] as CategoryType[]).map(
            (cat) => {
              const catTasks = tasksByCategory[cat];
              const catInfo = CATEGORIES[cat];
              if (catTasks.length === 0) return null;

              return (
                <Card key={cat} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: catInfo.color }}
                    />
                    <h3 className="text-sm font-semibold text-bark">
                      {catInfo.label}
                    </h3>
                    <span className="text-[11px] text-sand-400 ml-auto">
                      {catTasks.length} task{catTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 mb-3">
                    {catInfo.description}
                  </p>
                  {catTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </Card>
              );
            }
          )}

          {/* Edge case rulings */}
          {edgeCaseRules && edgeCaseRules.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-bark mb-2">
                Edge Case Rulings
              </h3>
              <p className="text-xs text-sand-500 mb-3">
                Agreed categorizations for ambiguous tasks.
              </p>
              {edgeCaseRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between py-2.5 border-b border-sand-100 last:border-b-0"
                >
                  <span className="text-sm text-bark">{rule.description}</span>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        CATEGORIES[rule.resolved_category as CategoryType]
                          ?.colorMuted + "30",
                      color:
                        CATEGORIES[rule.resolved_category as CategoryType]
                          ?.color,
                    }}
                  >
                    {CATEGORIES[rule.resolved_category as CategoryType]?.label ??
                      rule.resolved_category}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Pending change requests */}
          {changeRequests.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-bark mb-2">
                Change Requests
              </h3>
              {changeRequests.map((req) => (
                <ChangeRequestRow
                  key={req.id}
                  request={req}
                  memberMap={memberMap}
                  isOwnRequest={req.proposed_by === user.id}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
