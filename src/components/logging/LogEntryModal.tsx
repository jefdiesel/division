import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { TaskTemplate } from "@/lib/hooks/useTaskTemplates";
import { CATEGORIES } from "@/lib/constants";

interface LogEntryModalProps {
  task: TaskTemplate;
  onSave: (value: number, note?: string) => void;
  onClose: () => void;
}

export function LogEntryModal({ task, onSave, onClose }: LogEntryModalProps) {
  const category = CATEGORIES[task.category];
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
    }, 50);
    return () => clearTimeout(timer);
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

  const unitLabel =
    category.unit === "minutes" ? "min" : category.unit === "hours" ? "hrs" : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bark/30 backdrop-blur-sm" />

      {/* Sheet */}
      <Card
        className="relative w-full sm:max-w-sm mx-auto p-5 pb-8 sm:pb-5 rounded-b-none sm:rounded-b-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Task header */}
        <div className="flex items-center gap-3 mb-4">
          {task.icon && (
            <span className="text-xl" role="img" aria-label={task.name}>
              {task.icon}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-bark">{task.name}</h3>
            <p className="text-xs text-sand-600">{category.label}</p>
          </div>
        </div>

        {/* Value input */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-sand-700 mb-1.5">
            {category.unit === "minutes"
              ? "Duration (minutes)"
              : "Duration (hours)"}
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min="0"
              step={category.unit === "hours" ? "0.5" : "1"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2.5 rounded-xl bg-sand-50 border border-sand-200 text-bark text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-warm-400/40 focus:border-warm-400 transition-all"
            />
            {unitLabel && (
              <span className="text-sm text-sand-600 font-medium">
                {unitLabel}
              </span>
            )}
          </div>
        </div>

        {/* Optional note */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-sand-700 mb-1.5">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. deep clean"
            className="w-full px-3 py-2 rounded-xl bg-sand-50 border border-sand-200 text-bark text-sm focus:outline-none focus:ring-2 focus:ring-warm-400/40 focus:border-warm-400 transition-all placeholder:text-sand-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
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
