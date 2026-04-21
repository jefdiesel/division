"use client";

import { useState } from "react";
import { ParentProfile, TaskLog } from "@/lib/types";
import { getBalance, getTimePeriodStart } from "@/lib/store";

interface DashboardProps {
  parents: [ParentProfile, ParentProfile];
  logs: TaskLog[];
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ScoreCard({
  label,
  parent,
  value,
  otherValue,
  unit,
  showDollars,
}: {
  label: string;
  parent: ParentProfile;
  value: number;
  otherValue: number;
  unit: "count" | "time";
  showDollars?: number;
}) {
  const diff = value - otherValue;
  const isAhead = diff > 0;
  const isEven = unit === "count" ? Math.abs(diff) < 2 : Math.abs(diff) < 15;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "white",
        boxShadow: "0 1px 3px rgba(61,46,31,0.06)",
      }}
    >
      <div className="text-xs font-medium mb-2" style={{ color: "#8b6a4f" }}>
        {parent.emoji} {parent.name}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold" style={{ color: "#3d2e1f" }}>
          {unit === "count" ? value : formatHours(value)}
        </div>
        <div className="text-right">
          <div
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isEven ? "#f2ede5" : isAhead ? "#e4ebe4" : "#fdecd8",
              color: isEven ? "#8b6a4f" : isAhead ? "#374d37" : "#b64414",
            }}
          >
            {isEven
              ? "even"
              : isAhead
              ? `+${unit === "count" ? diff : formatHours(diff)}`
              : unit === "count"
              ? `${diff}`
              : formatHours(diff)}
          </div>
          {showDollars && showDollars > 0 ? (
            <div
              className="dollar-tooltip text-xs mt-1 cursor-help"
              style={{ color: "#b3936a" }}
              data-tooltip={`~$${showDollars} in labor contributed. This would cost hundreds weekly to hire out.`}
            >
              ~${showDollars}
            </div>
          ) : null}
        </div>
      </div>
      <div className="text-xs mt-1" style={{ color: "#b3936a" }}>
        {label}
      </div>
    </div>
  );
}

function ComparisonBar({
  parent1Name,
  parent2Name,
  value1,
  value2,
  emoji1,
  emoji2,
  unit,
}: {
  parent1Name: string;
  parent2Name: string;
  value1: number;
  value2: number;
  emoji1: string;
  emoji2: string;
  unit: "count" | "time";
}) {
  const total = value1 + value2;
  if (total === 0) return null;
  const pct1 = Math.round((value1 / total) * 100);
  const pct2 = 100 - pct1;

  const fmt = (v: number) => (unit === "count" ? `${v}` : formatHours(v));

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs" style={{ color: "#8b6a4f" }}>
        <span>
          {emoji1} {parent1Name} — {fmt(value1)}
        </span>
        <span>
          {fmt(value2)} — {parent2Name} {emoji2}
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden" style={{ background: "#f2ede5" }}>
        <div
          className="transition-all duration-500 rounded-l-full"
          style={{
            width: `${pct1}%`,
            background: "linear-gradient(90deg, #ea7522, #f5b67a)",
          }}
        />
        <div
          className="transition-all duration-500 rounded-r-full"
          style={{
            width: `${pct2}%`,
            background: "linear-gradient(90deg, #a2b8a2, #577757)",
          }}
        />
      </div>
      <div className="flex justify-between text-xs font-medium" style={{ color: "#8b6a4f" }}>
        <span>{pct1}%</span>
        <span>{pct2}%</span>
      </div>
    </div>
  );
}

export default function Dashboard({ parents, logs }: DashboardProps) {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const since = getTimePeriodStart(period);

  const b1 = getBalance(logs, "parent1", since);
  const b2 = getBalance(logs, "parent2", since);

  const hasData = logs.length > 0;

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f2ede5" }}>
        {(["week", "month", "all"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: period === p ? "white" : "transparent",
              color: period === p ? "#3d2e1f" : "#8b6a4f",
              boxShadow: period === p ? "0 1px 2px rgba(61,46,31,0.08)" : "none",
            }}
          >
            {p === "week" ? "This week" : p === "month" ? "This month" : "All time"}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.06)" }}
        >
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium" style={{ color: "#3d2e1f" }}>
            No tasks logged yet
          </p>
          <p className="text-sm mt-1" style={{ color: "#8b6a4f" }}>
            Start logging to see the balance
          </p>
        </div>
      ) : (
        <>
          {/* Parenting score — tally based */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#769476" }}
            >
              Parenting score
            </h3>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <ScoreCard
                label="tasks"
                parent={parents[0]}
                value={b1.parentingCount}
                otherValue={b2.parentingCount}
                unit="count"
              />
              <ScoreCard
                label="tasks"
                parent={parents[1]}
                value={b2.parentingCount}
                otherValue={b1.parentingCount}
                unit="count"
              />
            </div>
            <ComparisonBar
              parent1Name={parents[0].name}
              parent2Name={parents[1].name}
              value1={b1.parentingCount}
              value2={b2.parentingCount}
              emoji1={parents[0].emoji}
              emoji2={parents[1].emoji}
              unit="count"
            />
          </div>

          {/* Spouse-tier score — time + hidden dollars */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#ef8f44" }}
            >
              Spouse score
            </h3>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <ScoreCard
                label="contributed"
                parent={parents[0]}
                value={b1.spouseMinutes}
                otherValue={b2.spouseMinutes}
                unit="time"
                showDollars={b1.spouseDollars}
              />
              <ScoreCard
                label="contributed"
                parent={parents[1]}
                value={b2.spouseMinutes}
                otherValue={b1.spouseMinutes}
                unit="time"
                showDollars={b2.spouseDollars}
              />
            </div>
            <ComparisonBar
              parent1Name={parents[0].name}
              parent2Name={parents[1].name}
              value1={b1.spouseMinutes}
              value2={b2.spouseMinutes}
              emoji1={parents[0].emoji}
              emoji2={parents[1].emoji}
              unit="time"
            />
          </div>

          {/* My time — just accumulated hours per parent */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#f27a8b" }}
            >
              My time
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="rounded-xl p-4"
                style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.06)" }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: "#8b6a4f" }}>
                  {parents[0].emoji} {parents[0].name}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#3d2e1f" }}>
                  {formatHours(b1.freeTimeMinutes)}
                </div>
                <div className="text-xs mt-1" style={{ color: "#b3936a" }}>
                  time received
                </div>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.06)" }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: "#8b6a4f" }}>
                  {parents[1].emoji} {parents[1].name}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#3d2e1f" }}>
                  {formatHours(b2.freeTimeMinutes)}
                </div>
                <div className="text-xs mt-1" style={{ color: "#b3936a" }}>
                  time received
                </div>
              </div>
            </div>
          </div>

          {/* Overall */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #3d2e1f, #5e483b)",
              color: "#fef7f0",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#d3c4a7" }}
            >
              Overall picture
            </h3>
            {parents.map((p, i) => {
              const b = i === 0 ? b1 : b2;
              const other = i === 0 ? b2 : b1;
              const parentingDiff = b.parentingCount - other.parentingCount;
              const spouseDiff = b.spouseMinutes - other.spouseMinutes;

              return (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <span className="font-medium">
                    {p.emoji} {p.name}
                  </span>
                  <div className="flex gap-2 items-center flex-wrap justify-end">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          parentingDiff > 1
                            ? "rgba(118,148,118,0.3)"
                            : parentingDiff < -1
                            ? "rgba(234,117,34,0.3)"
                            : "rgba(211,196,167,0.3)",
                        color:
                          parentingDiff > 1
                            ? "#c9d7c9"
                            : parentingDiff < -1
                            ? "#fad5ae"
                            : "#d3c4a7",
                      }}
                    >
                      {b.parentingCount} parenting
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          spouseDiff > 15
                            ? "rgba(118,148,118,0.3)"
                            : spouseDiff < -15
                            ? "rgba(234,117,34,0.3)"
                            : "rgba(211,196,167,0.3)",
                        color:
                          spouseDiff > 15
                            ? "#c9d7c9"
                            : spouseDiff < -15
                            ? "#fad5ae"
                            : "#d3c4a7",
                      }}
                    >
                      {formatHours(b.spouseMinutes)} spouse
                    </span>
                    {b.freeTimeMinutes > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(242,122,139,0.2)", color: "#f7aab3" }}
                      >
                        {formatHours(b.freeTimeMinutes)} free
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
