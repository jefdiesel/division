"use client";

import { useState } from "react";
import { Category, ParentProfile, TaskLog } from "@/lib/types";
import { defaultPresets } from "@/lib/presets";
import { Balance } from "@/lib/store";

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface LogTaskProps {
  parents: [ParentProfile, ParentProfile];
  currentUser: "parent1" | "parent2";
  balances: [Balance, Balance];
  onLog: (log: Omit<TaskLog, "id" | "timestamp">) => void;
}

const categoryLabels: Record<Category, string> = {
  parenting: "Parenting",
  spouse: "Spouse-tier",
  "free-time": "My time",
};

const categoryColors: Record<Category, { bg: string; text: string; ring: string }> = {
  parenting: { bg: "#e4ebe4", text: "#374d37", ring: "#769476" },
  spouse: { bg: "#fdecd8", text: "#b64414", ring: "#ef8f44" },
  "free-time": { bg: "#fbd0d5", text: "#941e3d", ring: "#f27a8b" },
};

export default function LogTask({ parents, currentUser, balances, onLog }: LogTaskProps) {
  const [forParent, setForParent] = useState<"parent1" | "parent2">(currentUser);
  const [activeCategory, setActiveCategory] = useState<Category>("parenting");
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMinutes, setCustomMinutes] = useState(15);
  const [customDollar, setCustomDollar] = useState(0);
  const [freeTimeMinutes, setFreeTimeMinutes] = useState(30);
  const [recentlyLogged, setRecentlyLogged] = useState<string | null>(null);

  const filteredPresets = defaultPresets.filter((p) => p.category === activeCategory);

  const logPreset = (presetId: string) => {
    const preset = defaultPresets.find((p) => p.id === presetId);
    if (!preset) return;
    onLog({
      presetId: preset.id,
      name: preset.name,
      category: preset.category,
      parent: forParent,
      loggedBy: currentUser,
      minutes: preset.defaultMinutes || 0,
      dollarValue: preset.dollarValue,
    });
    setRecentlyLogged(presetId);
    setTimeout(() => setRecentlyLogged(null), 1200);
  };

  const logCustom = () => {
    if (!customName.trim()) return;
    onLog({
      name: customName.trim(),
      category: activeCategory,
      parent: forParent,
      loggedBy: currentUser,
      minutes: activeCategory === "parenting" ? 0 : customMinutes,
      dollarValue: customDollar || undefined,
    });
    setCustomName("");
    setCustomMinutes(15);
    setCustomDollar(0);
    setCustomMode(false);
  };

  const logFreeTime = () => {
    if (freeTimeMinutes <= 0) return;
    onLog({
      name: "My time",
      category: "free-time",
      parent: forParent,
      loggedBy: currentUser,
      minutes: freeTimeMinutes,
    });
    setFreeTimeMinutes(30);
    setRecentlyLogged("free-time-logged");
    setTimeout(() => setRecentlyLogged(null), 1200);
  };

  const loggedByOther = forParent !== currentUser;
  const forParentProfile = parents.find((p) => p.id === forParent)!;

  return (
    <div className="space-y-5">
      {/* Who is this for */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: "#8b6a4f" }}>
          Logging for
        </div>
        <div className="flex gap-2">
          {parents.map((p, i) => {
            const b = balances[i];
            const other = balances[i === 0 ? 1 : 0];
            const parentingDiff = b.parentingCount - other.parentingCount;
            const spouseDiff = b.spouseMinutes - other.spouseMinutes;
            const hasData = b.parentingCount + other.parentingCount + b.spouseMinutes + other.spouseMinutes > 0;
            const isActive = forParent === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setForParent(p.id)}
                className="flex-1 py-3 rounded-xl font-medium text-base transition-all"
                style={{
                  background: isActive ? "#3d2e1f" : "white",
                  color: isActive ? "#fef7f0" : "#8b6a4f",
                  boxShadow: isActive ? "none" : "0 1px 3px rgba(61,46,31,0.08)",
                }}
              >
                <div>{p.emoji} {p.name}</div>
                {hasData && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {parentingDiff !== 0 && (
                      <span
                        className="text-xs font-bold"
                        style={{ color: parentingDiff > 0 ? (isActive ? "#a2b8a2" : "#577757") : (isActive ? "#f5b67a" : "#d32d50") }}
                      >
                        {parentingDiff > 0 ? "+" : ""}{parentingDiff}
                      </span>
                    )}
                    {Math.abs(spouseDiff) >= 5 && (
                      <span
                        className="text-xs font-bold"
                        style={{ color: spouseDiff > 0 ? (isActive ? "#a2b8a2" : "#577757") : (isActive ? "#f5b67a" : "#d32d50") }}
                      >
                        {spouseDiff > 0 ? "+" : ""}{formatHours(spouseDiff)}
                      </span>
                    )}
                    {parentingDiff === 0 && Math.abs(spouseDiff) < 5 && (
                      <span
                        className="text-xs"
                        style={{ color: isActive ? "#d3c4a7" : "#b3936a" }}
                      >
                        even
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {loggedByOther && (
          <p className="text-xs mt-2 text-center" style={{ color: "#b3936a" }}>
            Logging on behalf of {forParentProfile.name}
          </p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeCategory === cat ? categoryColors[cat].bg : "transparent",
              color: activeCategory === cat ? categoryColors[cat].text : "#8b6a4f",
              border:
                activeCategory === cat
                  ? `2px solid ${categoryColors[cat].ring}`
                  : "2px solid transparent",
            }}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Free time — open meter */}
      {activeCategory === "free-time" ? (
        <div
          className="rounded-2xl p-6 text-center space-y-4"
          style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.08)" }}
        >
          <div className="text-3xl">🕐</div>
          <p className="text-sm font-medium" style={{ color: "#3d2e1f" }}>
            How much time did {forParentProfile.name} get?
          </p>
          <p className="text-xs" style={{ color: "#b3936a" }}>
            Time where the other parent was on duty so you could be off.
            <br />
            Self-made time (waking early, kid at school) doesn&apos;t count.
          </p>
          <div className="flex items-center justify-center gap-3">
            {[15, 30, 60, 90, 120, 180].map((m) => (
              <button
                key={m}
                onClick={() => setFreeTimeMinutes(m)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: freeTimeMinutes === m ? "#fbd0d5" : "#faf8f5",
                  color: freeTimeMinutes === m ? "#941e3d" : "#8b6a4f",
                  border: freeTimeMinutes === m ? "2px solid #f27a8b" : "2px solid transparent",
                }}
              >
                {m < 60 ? `${m}m` : `${m / 60}h`}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <label className="text-xs" style={{ color: "#8b6a4f" }}>
              Or exact minutes:
            </label>
            <input
              type="number"
              value={freeTimeMinutes}
              onChange={(e) => setFreeTimeMinutes(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-lg border text-sm text-center focus:outline-none"
              style={{ borderColor: "#e4dbc9", background: "#faf8f5" }}
            />
          </div>
          <button
            onClick={logFreeTime}
            className="w-full py-3 rounded-xl font-semibold text-base text-white transition-all"
            style={{
              background: recentlyLogged === "free-time-logged" ? "#769476" : "#ea7522",
            }}
          >
            {recentlyLogged === "free-time-logged" ? "Logged ✓" : "Log time"}
          </button>
        </div>
      ) : (
        <>
          {/* Preset grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => logPreset(preset.id)}
                className="relative text-left p-4 rounded-xl transition-all active:scale-[0.97]"
                style={{
                  background: recentlyLogged === preset.id ? "#e4ebe4" : "white",
                  boxShadow: "0 1px 3px rgba(61,46,31,0.06)",
                  border: recentlyLogged === preset.id ? "2px solid #769476" : "2px solid transparent",
                }}
              >
                <div className="text-xl mb-1">{preset.icon}</div>
                <div className="text-sm font-medium" style={{ color: "#3d2e1f" }}>
                  {preset.name}
                </div>
                {/* Parenting: no time shown. Spouse: show time */}
                {activeCategory === "spouse" && preset.defaultMinutes && (
                  <div className="text-xs mt-1" style={{ color: "#8b6a4f" }}>
                    {preset.defaultMinutes} min
                  </div>
                )}
                {preset.dollarValue && (
                  <div
                    className="dollar-tooltip absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#fdecd8", color: "#b64414" }}
                    data-tooltip={`This would cost ~$${preset.dollarValue} to hire out. How can you give back?`}
                  >
                    $
                  </div>
                )}
                {recentlyLogged === preset.id && (
                  <div
                    className="absolute top-3 right-3 text-lg"
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom entry */}
          {!customMode ? (
            <button
              onClick={() => setCustomMode(true)}
              className="w-full py-3 rounded-xl text-sm font-medium border-2 border-dashed transition-all"
              style={{ borderColor: "#d3c4a7", color: "#8b6a4f" }}
            >
              + Log something else
            </button>
          ) : (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.08)" }}
            >
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="What did you do?"
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: "#e4dbc9", background: "#faf8f5" }}
                autoFocus
              />
              {activeCategory === "spouse" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: "#8b6a4f" }}>
                      Minutes
                    </label>
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                      style={{ borderColor: "#e4dbc9", background: "#faf8f5" }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: "#8b6a4f" }}>
                      $ value (optional)
                    </label>
                    <input
                      type="number"
                      value={customDollar}
                      onChange={(e) => setCustomDollar(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                      style={{ borderColor: "#e4dbc9", background: "#faf8f5" }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs" style={{ color: "#b3936a" }}>
                {activeCategory === "parenting"
                  ? "Cleaning your own mess or cooking for yourself doesn't count."
                  : "Only shared labor counts — not self-maintenance."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={logCustom}
                  disabled={!customName.trim()}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm text-white disabled:opacity-40"
                  style={{ background: "#ea7522" }}
                >
                  Log it
                </button>
                <button
                  onClick={() => setCustomMode(false)}
                  className="px-4 py-2.5 rounded-lg text-sm"
                  style={{ color: "#8b6a4f" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
