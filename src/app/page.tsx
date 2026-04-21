"use client";

import { useState, useEffect, useCallback } from "react";
import { AppState, TaskLog, ParentProfile } from "@/lib/types";
import { loadState, saveState, addLog, deleteLog, updateParents, getBalance } from "@/lib/store";
import Setup from "@/components/Setup";
import LogTask from "@/components/LogTask";
import Dashboard from "@/components/Dashboard";
import History from "@/components/History";

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

type Tab = "log" | "dashboard" | "history";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "log", label: "Log", icon: "+" },
  { id: "dashboard", label: "Balance", icon: "◑" },
  { id: "history", label: "History", icon: "☰" },
];

export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("log");
  const [currentUser, setCurrentUser] = useState<"parent1" | "parent2">("parent1");

  useEffect(() => {
    setState(loadState());
  }, []);

  const handleSetup = useCallback((parents: [ParentProfile, ParentProfile]) => {
    setState((prev) => {
      if (!prev) return prev;
      return updateParents(prev, parents);
    });
  }, []);

  const handleLog = useCallback((log: Omit<TaskLog, "id" | "timestamp">) => {
    setState((prev) => {
      if (!prev) return prev;
      return addLog(prev, log);
    });
  }, []);

  const handleDelete = useCallback((logId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return deleteLog(prev, logId);
    });
  }, []);

  const handleReset = useCallback(() => {
    const fresh: AppState = {
      parents: [
        { id: "parent1", name: "Parent 1", emoji: "🧡" },
        { id: "parent2", name: "Parent 2", emoji: "💜" },
      ],
      logs: [],
      setupComplete: false,
    };
    saveState(fresh);
    setState(fresh);
  }, []);

  if (!state) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#fef7f0" }}
      >
        <div className="text-lg font-medium" style={{ color: "#8b6a4f" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!state.setupComplete) {
    return <Setup onComplete={handleSetup} />;
  }

  const currentParent = state.parents.find((p) => p.id === currentUser)!;
  const b1 = getBalance(state.logs, "parent1");
  const b2 = getBalance(state.logs, "parent2");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fef7f0" }}>
      {/* Header */}
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#3d2e1f" }}>
              Division
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#b3936a" }}>
              See the labor. Share the load.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentUser(currentUser === "parent1" ? "parent2" : "parent1")}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
              style={{ color: "#3d2e1f", background: "#f2ede5" }}
            >
              {currentParent.emoji} {currentParent.name}
              <span style={{ color: "#b3936a" }}> ▾</span>
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: "#b3936a", background: "#f2ede5" }}
            >
              Reset
            </button>
          </div>
        </div>

      </header>

      {/* Tab bar */}
      <nav className="px-5 mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f2ede5" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              style={{
                background: activeTab === tab.id ? "white" : "transparent",
                color: activeTab === tab.id ? "#3d2e1f" : "#8b6a4f",
                boxShadow: activeTab === tab.id ? "0 1px 2px rgba(61,46,31,0.08)" : "none",
              }}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-5 pb-8 max-w-lg mx-auto w-full">
        {activeTab === "log" && (
          <LogTask
            parents={state.parents}
            currentUser={currentUser}
            balances={[b1, b2]}
            onLog={handleLog}
          />
        )}
        {activeTab === "dashboard" && (
          <Dashboard parents={state.parents} logs={state.logs} />
        )}
        {activeTab === "history" && (
          <History parents={state.parents} logs={state.logs} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
