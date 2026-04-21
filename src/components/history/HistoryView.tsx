import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import {
  useEntries,
  useDeleteEntry,
  useCreateDispute,
  type Entry,
} from "@/lib/hooks/useEntries";
import {
  CATEGORIES,
  formatDuration,
  type CategoryType,
  type UnitType,
} from "@/lib/constants";

type FilterValue = "all" | CategoryType;

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "childcare", label: "Childcare" },
  { value: "household", label: "Household" },
  { value: "coverage", label: "Coverage" },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

function EntryRow({
  entry,
  isOwnEntry,
  memberName,
  onDelete,
  onDispute,
}: {
  entry: Entry;
  isOwnEntry: boolean;
  memberName: string;
  onDelete: (id: string) => void;
  onDispute: (entryId: string) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cat = (entry.task_templates?.category ?? "childcare") as CategoryType;
  const catInfo = CATEGORIES[cat];
  const unit = (entry.task_templates?.unit ?? catInfo.unit) as UnitType;
  const hasDisputes = (entry.disputes?.length ?? 0) > 0;

  return (
    <div className="py-3 border-b border-sand-100 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sand-50 text-lg shrink-0 mt-0.5">
          {entry.task_templates?.icon || "\u2022"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-bark truncate">
              {entry.task_templates?.name ?? "Unknown task"}
            </span>

            {/* Category badge */}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: catInfo.colorMuted + "30",
                color: catInfo.color,
              }}
            >
              {catInfo.label}
            </span>

            {/* Disputed marker */}
            {hasDisputes && (
              <span className="text-[10px] font-medium text-sand-500 bg-sand-100 px-1.5 py-0.5 rounded-full shrink-0">
                contested
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-sand-600">
              {formatDuration(entry.value, unit)}
            </span>
            <span className="text-[10px] text-sand-400">
              {memberName}
            </span>
            <span className="text-[10px] text-sand-400">
              {formatTimestamp(entry.logged_at)}
            </span>
          </div>

          {entry.note && (
            <p className="text-xs text-sand-500 mt-0.5 truncate">
              {entry.note}
            </p>
          )}
        </div>

        {/* Actions: always visible, small and subtle */}
        <div className="shrink-0 flex items-center gap-1 mt-1">
          {/* Own entries: delete button (always visible, not hover-gated) */}
          {isOwnEntry && !confirmingDelete && (
            <button
              className="p-1.5 rounded-lg text-sand-300 hover:text-sand-500 hover:bg-sand-50 transition-colors"
              onClick={() => setConfirmingDelete(true)}
              title="Remove this entry"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
            </button>
          )}

          {/* Other parent's entries: flag button if no dispute yet */}
          {!isOwnEntry && !hasDisputes && (
            <button
              className="p-1.5 rounded-lg text-sand-300 hover:text-sand-500 hover:bg-sand-50 transition-colors"
              onClick={() => onDispute(entry.id)}
              title="Flag this entry"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Inline delete confirmation (replaces window.confirm) */}
      {confirmingDelete && (
        <div className="flex items-center gap-2 mt-2 ml-12 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-xs text-sand-500">Remove this entry?</span>
          <button
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-warm-50 text-warm-700 border border-warm-200 hover:bg-warm-100 transition-colors active:scale-95"
            onClick={() => {
              onDelete(entry.id);
              setConfirmingDelete(false);
            }}
          >
            Yes
          </button>
          <button
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-sand-500 hover:text-sand-700 hover:bg-sand-50 transition-colors active:scale-95"
            onClick={() => setConfirmingDelete(false)}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

export function HistoryView() {
  const { user } = useAuth();
  const { data: householdData } = useHousehold();
  const household = householdData?.household;
  const members = householdData?.members ?? [];
  const householdId = household?.id;

  const { data: entries, isLoading } = useEntries(householdId);
  const deleteEntry = useDeleteEntry();
  const createDispute = useCreateDispute();

  const [filter, setFilter] = useState<FilterValue>("all");

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      map[m.user_id] = m.display_name;
    }
    return map;
  }, [members]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    if (filter === "all") return entries;
    return entries.filter(
      (e) => e.task_templates?.category === filter
    );
  }, [entries, filter]);

  const handleDelete = (entryId: string) => {
    deleteEntry.mutate(entryId);
  };

  const handleDispute = (entryId: string) => {
    createDispute.mutate({ entryId });
  };

  if (!householdId || !user) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="pt-4 pb-3">
        <h1 className="text-2xl font-display font-semibold text-bark">History</h1>
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <SegmentedControl
          options={FILTER_OPTIONS}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      {/* Entry list */}
      {isLoading ? (
        <Spinner className="py-12" />
      ) : filtered.length === 0 ? (
        <Card className="py-12 px-6 text-center">
          <p className="text-sm text-sand-600 mb-1">
            Nothing logged yet.
          </p>
          <p className="text-xs text-sand-400 mb-4">
            Head to the Log tab to record your first task.
          </p>
          <Link to="/app/log">
            <Button variant="secondary" size="sm">
              Go to Log
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="px-4">
          {filtered.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isOwnEntry={entry.user_id === user.id}
              memberName={memberMap[entry.user_id] ?? "Unknown"}
              onDelete={handleDelete}
              onDispute={handleDispute}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
