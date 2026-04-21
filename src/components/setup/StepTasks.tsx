import { useEffect, useRef, useState } from "react";
import { CATEGORIES, type CategoryType, type SetupStep } from "@/lib/constants";
import { formatDollars } from "@/lib/constants";
import {
  useTaskTemplates,
  useSeedTasks,
  useUpdateTask,
  useAddTask,
  type TaskTemplate,
} from "@/lib/hooks/useTaskTemplates";
import { useApproveStep } from "@/lib/hooks/useSetup";
import type { SetupApproval } from "@/lib/hooks/useSetup";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HouseholdMember } from "@/lib/hooks/useHousehold";
import { seedTasks } from "@/lib/seed-tasks";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ApprovalStatus } from "./ApprovalStatus";

interface StepTasksProps {
  householdId: string;
  members: HouseholdMember[];
  approvals: SetupApproval[];
}

const STEP: SetupStep = "tasks";

const categoryOptions = Object.entries(CATEGORIES).map(([value, cat]) => ({
  value: value as CategoryType,
  label: cat.label,
}));

// ---------- Inline edit row ----------

function TaskRow({
  task,
  onUpdate,
  onDeactivate,
}: {
  task: TaskTemplate;
  onUpdate: (id: string, updates: Partial<TaskTemplate>) => void;
  onDeactivate: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [category, setCategory] = useState<CategoryType>(task.category);
  const [rate, setRate] = useState(task.market_rate_usd_hr?.toString() ?? "");

  const save = () => {
    const updates: Partial<TaskTemplate> = {};
    if (name !== task.name) updates.name = name;
    if (category !== task.category) {
      updates.category = category;
      updates.unit = CATEGORIES[category].unit;
    }
    const parsedRate = rate ? parseFloat(rate) : null;
    if (parsedRate !== task.market_rate_usd_hr) updates.market_rate_usd_hr = parsedRate;
    if (Object.keys(updates).length > 0) onUpdate(task.id, updates);
    setEditing(false);
  };

  const cancel = () => {
    setName(task.name);
    setCategory(task.category);
    setRate(task.market_rate_usd_hr?.toString() ?? "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="px-4 py-3 space-y-3 bg-sand-50 rounded-xl">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Task name"
        />
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-bark mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-white text-bark text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {category === "household" && (
            <div className="w-28">
              <Input
                label="$/hr"
                type="number"
                min={0}
                step={5}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={cancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 group">
      <span className="text-lg w-7 text-center shrink-0">{task.icon || "~"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-bark truncate">{task.name}</p>
        {task.category === "household" && task.market_rate_usd_hr != null && (
          <p className="text-xs text-sand-500">
            {formatDollars(task.market_rate_usd_hr)}/hr market rate
          </p>
        )}
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
        style={{
          backgroundColor: CATEGORIES[task.category].colorMuted + "25",
          color: CATEGORIES[task.category].color,
        }}
      >
        {CATEGORIES[task.category].label}
      </span>
      <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-sand-500 hover:text-bark hover:bg-sand-100 transition-colors"
          aria-label="Edit task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => onDeactivate(task.id)}
          className="p-1.5 rounded-lg text-sand-500 hover:text-warm-600 hover:bg-warm-50 transition-colors"
          aria-label="Remove task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------- Add custom task ----------

function AddTaskForm({
  householdId,
  onClose,
}: {
  householdId: string;
  onClose: () => void;
}) {
  const addTask = useAddTask();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryType>("childcare");
  const [rate, setRate] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    addTask.mutate(
      {
        household_id: householdId,
        name: name.trim(),
        category,
        unit: CATEGORIES[category].unit,
        market_rate_usd_hr: rate ? parseFloat(rate) : undefined,
        icon: undefined,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Card className="p-4 space-y-3 border-2 border-dashed border-sand-200">
      <p className="text-sm font-semibold text-bark">Add a custom task</p>
      <Input
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-bark mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryType)}
            className="w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-white text-bark text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {category === "household" && (
          <div className="w-28">
            <Input
              label="$/hr"
              type="number"
              min={0}
              step={5}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={addTask.isPending || !name.trim()}>
          {addTask.isPending ? "Adding..." : "Add task"}
        </Button>
      </div>
    </Card>
  );
}

// ---------- Main step ----------

export function StepTasks({ householdId, members, approvals }: StepTasksProps) {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTaskTemplates(householdId);
  const seedTasksMut = useSeedTasks();
  const updateTask = useUpdateTask();
  const approveStep = useApproveStep();
  const [showAdd, setShowAdd] = useState(false);
  const seeded = useRef(false);

  // Auto-seed on first load if no tasks exist yet
  useEffect(() => {
    if (seeded.current || isLoading || !tasks) return;
    if (tasks.length === 0) {
      seeded.current = true;
      seedTasksMut.mutate({ householdId, tasks: seedTasks });
    }
  }, [tasks, isLoading, householdId, seedTasksMut]);

  const alreadyApproved = approvals.some(
    (a) => a.step === STEP && a.user_id === user?.id
  );

  const handleUpdate = (id: string, updates: Partial<TaskTemplate>) => {
    updateTask.mutate({ id, ...updates });
  };

  const handleDeactivate = (id: string) => {
    updateTask.mutate({ id, is_active: false });
  };

  const handleApprove = () => {
    approveStep.mutate({ householdId, step: STEP });
  };

  if (isLoading || seedTasksMut.isPending) {
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
        <h2 className="text-2xl font-display font-semibold text-bark">Review the task list</h2>
        <p className="text-sm text-sand-600 mt-1">
          These are the things you'll be logging. Edit, remove, or add tasks until the list
          feels right to both of you.
        </p>
      </div>

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
              <span className="text-xs text-sand-400">{catTasks.length}</span>
            </div>
            <Card className="divide-y divide-sand-100">
              {catTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdate}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </Card>
          </div>
        );
      })}

      {showAdd ? (
        <AddTaskForm
          householdId={householdId}
          onClose={() => setShowAdd(false)}
        />
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-sand-200 text-sm font-medium text-sand-600 hover:border-sand-300 hover:text-bark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add custom task
        </button>
      )}

      <Card className="p-4 bg-sand-50 space-y-3">
        <ApprovalStatus approvals={approvals} members={members} step={STEP} />

        {!alreadyApproved && (
          <Button
            size="lg"
            className="w-full"
            onClick={handleApprove}
            disabled={approveStep.isPending}
          >
            {approveStep.isPending ? "Saving..." : "Approve task list"}
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
