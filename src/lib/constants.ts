export type CategoryType = "childcare" | "household" | "coverage";
export type UnitType = "count" | "minutes" | "hours";

export const CATEGORIES: Record<
  CategoryType,
  { label: string; unit: UnitType; description: string; color: string; colorMuted: string }
> = {
  childcare: {
    label: "Childcare",
    unit: "count",
    description:
      "Direct work with or for the child. If the kid is the reason you're doing it, it's childcare.",
    color: "#577757",
    colorMuted: "#a2b8a2",
  },
  household: {
    label: "Household",
    unit: "minutes",
    description:
      "Labor that serves the shared home, not a specific person. If you'd pay someone to do it, it's household.",
    color: "#b64414",
    colorMuted: "#ef8f44",
  },
  coverage: {
    label: "Coverage",
    unit: "hours",
    description:
      "Hours where one parent was solo-on so the other could be off. Does not include time the kid was at school/daycare or asleep.",
    color: "#725745",
    colorMuted: "#b3936a",
  },
};

export const SETUP_STEPS = ["categories", "tasks", "edge_cases", "final"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export const EDGE_CASE_PROMPTS = [
  {
    id: "dinner-together",
    description: "Cooking dinner when everyone eats together",
    options: ["childcare", "household"] as CategoryType[],
  },
  {
    id: "tidy-toys",
    description: "Tidying up toys in the living room",
    options: ["childcare", "household"] as CategoryType[],
  },
  {
    id: "groceries-kid-snacks",
    description: "Grocery shopping that includes kid snacks and food",
    options: ["childcare", "household"] as CategoryType[],
  },
  {
    id: "drive-playdate",
    description: "Driving the kid to a playdate",
    options: ["childcare", "coverage"] as CategoryType[],
  },
  {
    id: "home-during-nap",
    description: "Staying home while kid naps so partner can go out",
    options: ["coverage"] as CategoryType[],
    note: "Or does this not count?",
  },
  {
    id: "mixed-laundry",
    description: "Doing kid's laundry mixed with household laundry",
    options: ["childcare", "household"] as CategoryType[],
  },
  {
    id: "birthday-party",
    description: "Planning a birthday party for the child",
    options: ["childcare", "household"] as CategoryType[],
  },
  {
    id: "doctor-appt",
    description: "Scheduling and taking child to doctor appointments",
    options: ["childcare", "coverage"] as CategoryType[],
  },
];

export function formatDuration(value: number, unit: UnitType): string {
  if (unit === "count") return `${value}`;
  if (unit === "hours") {
    if (value === 1) return "1 hr";
    return `${value} hrs`;
  }
  // minutes
  if (value < 60) return `${value}m`;
  const h = Math.floor(value / 60);
  const m = value % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDollars(cents: number): string {
  return `$${Math.round(cents)}`;
}
