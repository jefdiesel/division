import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import { CATEGORIES, type CategoryType } from "@/lib/constants";

interface LogEntryModalProps {
  task: TaskTemplate;
  category?: CategoryType;
  onSave: (value: number, note?: string) => void;
  onClose: () => void;
}

const QUICK_PICKS: Record<string, { label: string; value: number }[]> = {
  household: [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
  ],
  coverage: [
    { label: "1h", value: 1 },
    { label: "2h", value: 2 },
    { label: "3h", value: 3 },
    { label: "4h", value: 4 },
  ],
};

export function LogEntryModal({ task, category: categoryProp, onSave, onClose }: LogEntryModalProps) {
  const cat = categoryProp ?? task.category as CategoryType;
  const categoryInfo = CATEGORIES[cat];
  const [value, setValue] = useState<string>(
    task.default_value?.toString() ?? ""
  );
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select the value input for fast editing
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    onSave(numValue, note.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleQuickPick = (quickValue: number) => {
    setValue(quickValue.toString());
  };

  const unitLabel =
    categoryInfo.unit === "minutes" ? "min" : categoryInfo.unit === "hours" ? "hrs" : "";

  const picks = QUICK_PICKS[cat] ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bark/30 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Bottom sheet */}
      <Card
        className="relative w-full max-w-lg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-t-2xl rounded-b-none animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-sand-200" />
        </div>

        {/* Task header */}
        <div className="flex items-center gap-3 mb-4">
          {task.icon && (
            <span className="text-xl" role="img" aria-label={task.name}>
              {task.icon}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-bark">{task.name}</h3>
            <p className="text-xs text-sand-600">{categoryInfo.label}</p>
          </div>
        </div>

        {/* Quick-pick buttons */}
        {picks.length > 0 && (
          <div className="flex gap-2 mb-3">
            {picks.map((pick) => (
              <button
                key={pick.label}
                type="button"
                onClick={() => handleQuickPick(pick.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  value === pick.value.toString()
                    ? "bg-warm-100 border border-warm-400 text-warm-700"
                    : "bg-sand-50 border border-sand-200 text-sand-700 hover:border-sand-300"
                }`}
              >
                {pick.label}
              </button>
            ))}
          </div>
        )}

        {/* Value input */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-sand-700 mb-1.5">
            {categoryInfo.unit === "minutes"
              ? "Duration (minutes)"
              : "Duration (hours)"}
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min="0"
              step={categoryInfo.unit === "hours" ? "0.5" : "1"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3.5 rounded-xl bg-sand-50 border border-sand-200 text-bark text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-warm-400/40 focus:border-warm-400 transition-all"
            />
            {unitLabel && (
              <span className="text-sm text-sand-600 font-medium">
                {unitLabel}
              </span>
            )}
          </div>
        </div>

        {/* Optional note */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-sand-700 mb-1.5">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. deep clean"
            className="w-full px-4 py-3 rounded-xl bg-sand-50 border border-sand-200 text-bark text-sm focus:outline-none focus:ring-2 focus:ring-warm-400/40 focus:border-warm-400 transition-all placeholder:text-sand-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="md" className="flex-1 !py-3" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 !py-3"
            onClick={handleSave}
            disabled={!value || parseFloat(value) <= 0}
          >
            Log
          </Button>
        </div>
      </Card>
    </div>
  );
}
