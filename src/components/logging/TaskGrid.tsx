import { useState } from "react";
import type { TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import type { CategoryType } from "@/lib/constants";
import { LogEntryModal } from "./LogEntryModal";

interface TaskGridProps {
  tasks: TaskTemplate[];
  category: CategoryType;
  onLog: (taskId: string, value: number, note?: string) => void;
  isPending?: boolean;
}

export function TaskGrid({ tasks, category, onLog, isPending }: TaskGridProps) {
  const [modalTask, setModalTask] = useState<TaskTemplate | null>(null);
  // Track which task just had a successful instant log for visual feedback
  const [flashId, setFlashId] = useState<string | null>(null);

  const handleTap = (task: TaskTemplate) => {
    if (isPending) return;

    // Childcare: instant log count=1
    if (category === "childcare") {
      onLog(task.id, 1);
      setFlashId(task.id);
      setTimeout(() => setFlashId(null), 600);
      return;
    }

    // Household / coverage: open the value modal
    setModalTask(task);
  };

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

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleTap(task)}
            disabled={isPending}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 disabled:opacity-50 ${
              flashId === task.id
                ? "bg-sage-100 border-sage-300"
                : "bg-white border-sand-200 hover:border-sand-300 hover:bg-sand-50"
            }`}
          >
            <span className="text-2xl leading-none" role="img" aria-label={task.name}>
              {task.icon || "\u2022"}
            </span>
            <span className="text-xs font-medium text-bark text-center leading-tight line-clamp-2">
              {task.name}
            </span>
          </button>
        ))}
      </div>

      {modalTask && (
        <LogEntryModal
          task={modalTask}
          onSave={handleModalSave}
          onClose={() => setModalTask(null)}
        />
      )}
    </>
  );
}
