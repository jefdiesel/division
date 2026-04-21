import { useState, useEffect, useCallback } from "react";
import type { TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import type { CategoryType } from "@/lib/constants";
import { LogEntryModal } from "./LogEntryModal";

interface TaskGridProps {
  tasks: TaskTemplate[];
  category: CategoryType;
  onLog: (taskId: string, value: number, note?: string) => void;
  isPending?: boolean;
}

const RECENT_KEY = "division:recentTasks";
const MAX_RECENT = 4;

function getRecentIds(category: CategoryType): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "{}");
    return (stored[category] ?? []).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function pushRecentId(category: CategoryType, taskId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "{}");
    const list: string[] = stored[category] ?? [];
    // Move to front, deduplicate, cap at MAX_RECENT
    const next = [taskId, ...list.filter((id: string) => id !== taskId)].slice(0, MAX_RECENT);
    stored[category] = next;
    localStorage.setItem(RECENT_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

export function TaskGrid({ tasks, category, onLog, isPending }: TaskGridProps) {
  const [modalTask, setModalTask] = useState<TaskTemplate | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentIds(category));

  // Refresh recent IDs when category changes
  useEffect(() => {
    setRecentIds(getRecentIds(category));
  }, [category]);

  const handleTap = useCallback(
    (task: TaskTemplate) => {
      if (isPending) return;

      // Track as recently used
      pushRecentId(category, task.id);
      setRecentIds(getRecentIds(category));

      // Childcare: instant log count=1
      if (category === "childcare") {
        onLog(task.id, 1);
        setFlashId(task.id);
        setTimeout(() => setFlashId(null), 600);
        return;
      }

      // Household / coverage: open the value modal
      setModalTask(task);
    },
    [isPending, category, onLog]
  );

  const handleModalSave = (value: number, note?: string) => {
    if (!modalTask) return;
    onLog(modalTask.id, value, note);
    setModalTask(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-sand-500 text-sm">
        No tasks in this category yet.
      </div>
    );
  }

  // Split into quick-log (recent) and remaining
  const recentTasks = recentIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is TaskTemplate => t != null);

  const recentIdSet = new Set(recentTasks.map((t) => t.id));
  const remainingTasks = tasks.filter((t) => !recentIdSet.has(t.id));

  return (
    <>
      {/* Quick log: recently used tasks as slightly larger buttons */}
      {recentTasks.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-medium text-sand-400 uppercase tracking-wide mb-2">
            Quick log
          </p>
          <div className="grid grid-cols-2 gap-2">
            {recentTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTap(task)}
                disabled={isPending}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all active:scale-[0.97] disabled:opacity-50 ${
                  flashId === task.id
                    ? "bg-sage-100 border-sage-300"
                    : "bg-white border-sand-200 hover:border-sand-300 hover:bg-sand-50"
                }`}
              >
                <span className="text-xl leading-none shrink-0" role="img" aria-label={task.name}>
                  {task.icon || "\u2022"}
                </span>
                <span className="text-sm font-medium text-bark text-left leading-tight line-clamp-1">
                  {task.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remaining tasks: compact list */}
      {remainingTasks.length > 0 && (
        <div>
          {recentTasks.length > 0 && (
            <p className="text-[11px] font-medium text-sand-400 uppercase tracking-wide mb-2">
              All tasks
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {remainingTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleTap(task)}
                disabled={isPending}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
                  flashId === task.id
                    ? "bg-sage-100"
                    : "hover:bg-sand-50"
                }`}
              >
                <span className="text-base leading-none shrink-0" role="img" aria-label={task.name}>
                  {task.icon || "\u2022"}
                </span>
                <span className="text-sm text-bark text-left leading-tight truncate">
                  {task.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {modalTask && (
        <LogEntryModal
          task={modalTask}
          category={category}
          onSave={handleModalSave}
          onClose={() => setModalTask(null)}
        />
      )}
    </>
  );
}
