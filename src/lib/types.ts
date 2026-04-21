export type Category = "parenting" | "spouse" | "free-time";

export interface TaskPreset {
  id: string;
  name: string;
  category: Category;
  defaultMinutes?: number; // optional — parenting has no time
  dollarValue?: number;
  icon: string;
}

export interface TaskLog {
  id: string;
  presetId?: string;
  name: string;
  category: Category;
  parent: "parent1" | "parent2";
  loggedBy: "parent1" | "parent2"; // who logged it — can log for the other
  minutes: number; // 0 for parenting tallies
  dollarValue?: number;
  timestamp: number;
  note?: string;
}

export interface ParentProfile {
  id: "parent1" | "parent2";
  name: string;
  emoji: string;
}

export interface AppState {
  parents: [ParentProfile, ParentProfile];
  logs: TaskLog[];
  setupComplete: boolean;
}
