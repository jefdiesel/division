"use client";

import { useState } from "react";
import { ParentProfile, TaskLog, Category } from "@/lib/types";

interface HistoryProps {
  parents: [ParentProfile, ParentProfile];
  logs: TaskLog[];
  onDelete: (logId: string) => void;
}

const categoryBadge: Record<Category, { bg: string; text: string; label: string }> = {
  parenting: { bg: "#e4ebe4", text: "#374d37", label: "Parenting" },
  spouse: { bg: "#fdecd8", text: "#b64414", label: "Spouse-tier" },
  "free-time": { bg: "#fbd0d5", text: "#941e3d", label: "My time" },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

export default function History({ parents, logs, onDelete }: HistoryProps) {
  const [filterParent, setFilterParent] = useState<"all" | "parent1" | "parent2">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");

  const filtered = logs.filter((l) => {
    if (filterParent !== "all" && l.parent !== filterParent) return false;
    if (filterCategory !== "all" && l.category !== filterCategory) return false;
    return true;
  });

  const getParent = (id: "parent1" | "parent2") =>
    parents.find((p) => p.id === id) || parents[0];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterParent}
          onChange={(e) => setFilterParent(e.target.value as "all" | "parent1" | "parent2")}
          className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
          style={{ borderColor: "#e4dbc9", background: "white", color: "#3d2e1f" }}
        >
          <option value="all">Both parents</option>
          <option value="parent1">{parents[0].emoji} {parents[0].name}</option>
          <option value="parent2">{parents[1].emoji} {parents[1].name}</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as "all" | Category)}
          className="px-3 py-2 rounded-lg text-sm border focus:outline-none"
          style={{ borderColor: "#e4dbc9", background: "white", color: "#3d2e1f" }}
        >
          <option value="all">All categories</option>
          <option value="parenting">Parenting</option>
          <option value="spouse">Spouse-tier</option>
          <option value="free-time">My time</option>
        </select>
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl"
          style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.06)" }}
        >
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm" style={{ color: "#8b6a4f" }}>
            {logs.length === 0 ? "Nothing logged yet" : "No matching entries"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const parent = getParent(log.parent);
            const loggedBy = log.loggedBy && log.loggedBy !== log.parent ? getParent(log.loggedBy) : null;
            const badge = categoryBadge[log.category];
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3.5 rounded-xl group"
                style={{ background: "white", boxShadow: "0 1px 2px rgba(61,46,31,0.04)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ background: "#f2ede5" }}
                >
                  {parent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: "#3d2e1f" }}>
                      {log.name}
                    </span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {log.category !== "parenting" && log.minutes > 0 && (
                      <span className="text-xs" style={{ color: "#8b6a4f" }}>
                        {log.minutes} min
                      </span>
                    )}
                    {log.dollarValue ? (
                      <span
                        className="dollar-tooltip text-xs cursor-help"
                        style={{ color: "#b3936a" }}
                        data-tooltip={`This would cost ~$${log.dollarValue} to hire out`}
                      >
                        ~${log.dollarValue}
                      </span>
                    ) : null}
                    <span className="text-xs" style={{ color: "#b3936a" }}>
                      {formatTime(log.timestamp)}
                    </span>
                    {loggedBy && (
                      <span className="text-xs" style={{ color: "#d3c4a7" }}>
                        logged by {loggedBy.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(log.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg transition-opacity"
                  style={{ color: "#b3936a" }}
                >
                  undo
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
