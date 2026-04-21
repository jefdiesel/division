import { useState, useCallback } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Spinner } from "@/components/ui/Spinner";
import { TaskGrid } from "./TaskGrid";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { useTaskTemplates } from "@/lib/hooks/useTaskTemplates";
import { useCreateEntry } from "@/lib/hooks/useEntries";
import { CATEGORIES, type CategoryType } from "@/lib/constants";

const CATEGORY_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: "childcare", label: CATEGORIES.childcare.label },
  { value: "household", label: CATEGORIES.household.label },
  { value: "coverage", label: CATEGORIES.coverage.label },
];

export function LogView() {
  const { user } = useAuth();
  const { data: householdData } = useHousehold();
  const householdId = householdData?.household?.id;

  const { data: tasks, isLoading: tasksLoading } = useTaskTemplates(householdId);
  const createEntry = useCreateEntry();

  const [category, setCategory] = useState<CategoryType>("childcare");
  const [toast, setToast] = useState<string | null>(null);

  const filteredTasks = (tasks ?? []).filter((t) => t.category === category);

  const handleLog = useCallback(
    (taskId: string, value: number, note?: string) => {
      if (!householdId) return;
      const task = tasks?.find((t) => t.id === taskId);
      createEntry.mutate(
        { household_id: householdId, task_template_id: taskId, value, note },
        {
          onSuccess: () => {
            setToast(`Logged ${task?.name ?? "entry"}`);
            setTimeout(() => setToast(null), 1500);
          },
        }
      );
    },
    [householdId, tasks, createEntry]
  );

  if (!user || !householdId) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold text-bark">Log</h1>
        <p className="text-sm text-sand-600 mt-0.5">
          Tap to record what you did.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-4">
        <SegmentedControl
          options={CATEGORY_OPTIONS}
          selected={category}
          onChange={setCategory}
        />
      </div>

      {/* Category description */}
      <p className="text-xs text-sand-500 mb-4 leading-relaxed">
        {CATEGORIES[category].description}
      </p>

      {/* Task grid */}
      {tasksLoading ? (
        <Spinner className="py-12" />
      ) : (
        <TaskGrid
          tasks={filteredTasks}
          category={category}
          onLog={handleLog}
          isPending={createEntry.isPending}
        />
      )}

      {/* Childcare hint */}
      {category === "childcare" && !tasksLoading && filteredTasks.length > 0 && (
        <p className="text-xs text-sand-400 text-center mt-4">
          Tap once to log. Each tap records 1 count.
        </p>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-bark text-white text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
