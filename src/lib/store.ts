"use client";

import { AppState, TaskLog, ParentProfile } from "./types";
import { v4 as uuid } from "uuid";

const STORAGE_KEY = "division-app-state";

const defaultState: AppState = {
  parents: [
    { id: "parent1", name: "Parent 1", emoji: "🧡" },
    { id: "parent2", name: "Parent 2", emoji: "💜" },
  ],
  logs: [],
  setupComplete: false,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw);
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addLog(
  state: AppState,
  log: Omit<TaskLog, "id" | "timestamp">
): AppState {
  const newLog: TaskLog = {
    ...log,
    id: uuid(),
    timestamp: Date.now(),
  };
  const newState = { ...state, logs: [newLog, ...state.logs] };
  saveState(newState);
  return newState;
}

export function deleteLog(state: AppState, logId: string): AppState {
  const newState = {
    ...state,
    logs: state.logs.filter((l) => l.id !== logId),
  };
  saveState(newState);
  return newState;
}

export function updateParents(
  state: AppState,
  parents: [ParentProfile, ParentProfile]
): AppState {
  const newState = { ...state, parents, setupComplete: true };
  saveState(newState);
  return newState;
}

// === Balance calculations ===

export interface Balance {
  parentingCount: number; // tally, not minutes
  spouseMinutes: number;
  spouseDollars: number;
  freeTimeMinutes: number; // just accumulated hours
}

export function getBalance(
  logs: TaskLog[],
  parentId: "parent1" | "parent2",
  since?: number
): Balance {
  const filtered = logs.filter(
    (l) => l.parent === parentId && (!since || l.timestamp >= since)
  );

  const balance: Balance = {
    parentingCount: 0,
    spouseMinutes: 0,
    spouseDollars: 0,
    freeTimeMinutes: 0,
  };

  for (const log of filtered) {
    switch (log.category) {
      case "parenting":
        balance.parentingCount += 1;
        break;
      case "spouse":
        balance.spouseMinutes += log.minutes;
        balance.spouseDollars += log.dollarValue || 0;
        break;
      case "free-time":
        balance.freeTimeMinutes += log.minutes;
        break;
    }
  }

  return balance;
}

export function getTimePeriodStart(period: "week" | "month" | "all"): number | undefined {
  if (period === "all") return undefined;
  const now = new Date();
  if (period === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0).getTime();
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}
