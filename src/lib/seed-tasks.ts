import { CategoryType, UnitType } from "./constants";

export interface SeedTask {
  name: string;
  category: CategoryType;
  unit: UnitType;
  default_value?: number;
  market_rate_usd_hr?: number;
  icon: string;
}

export const seedTasks: SeedTask[] = [
  // === CHILDCARE (count) ===
  { name: "Cook breakfast for child", category: "childcare", unit: "count", icon: "🍳" },
  { name: "Make lunch for child", category: "childcare", unit: "count", icon: "🥪" },
  { name: "Cook dinner for child", category: "childcare", unit: "count", icon: "🍲" },
  { name: "Bathe child", category: "childcare", unit: "count", icon: "🛁" },
  { name: "Brush teeth", category: "childcare", unit: "count", icon: "🪥" },
  { name: "Hair — brush & braid", category: "childcare", unit: "count", icon: "💇" },
  { name: "Pajamas & bedtime prep", category: "childcare", unit: "count", icon: "👕" },
  { name: "Bedtime stories", category: "childcare", unit: "count", icon: "📖" },
  { name: "Co-sleep / bedtime", category: "childcare", unit: "count", icon: "🌙" },
  { name: "Play with child", category: "childcare", unit: "count", icon: "🧸" },
  { name: "School drop-off", category: "childcare", unit: "count", icon: "🚗" },
  { name: "School pick-up", category: "childcare", unit: "count", icon: "🏫" },
  { name: "Sick care", category: "childcare", unit: "count", icon: "🤒" },
  { name: "Child's laundry", category: "childcare", unit: "count", icon: "👶" },
  { name: "Homework / learning", category: "childcare", unit: "count", icon: "📚" },

  // === HOUSEHOLD (minutes, with market rates) ===
  { name: "Mow the lawn", category: "household", unit: "minutes", default_value: 120, market_rate_usd_hr: 100, icon: "🌿" },
  { name: "Yard work", category: "household", unit: "minutes", default_value: 60, market_rate_usd_hr: 75, icon: "🌳" },
  { name: "House maintenance", category: "household", unit: "minutes", default_value: 60, market_rate_usd_hr: 150, icon: "🏠" },
  { name: "Dishes", category: "household", unit: "minutes", default_value: 20, market_rate_usd_hr: 30, icon: "🍽️" },
  { name: "Household laundry", category: "household", unit: "minutes", default_value: 30, market_rate_usd_hr: 30, icon: "🧺" },
  { name: "Vacuuming", category: "household", unit: "minutes", default_value: 25, market_rate_usd_hr: 35, icon: "🧹" },
  { name: "Tidy the house", category: "household", unit: "minutes", default_value: 30, market_rate_usd_hr: 35, icon: "✨" },
  { name: "Take the trash out", category: "household", unit: "minutes", default_value: 10, market_rate_usd_hr: 30, icon: "🗑️" },
  { name: "Trash to the curb", category: "household", unit: "minutes", default_value: 10, market_rate_usd_hr: 30, icon: "🚛" },
  { name: "Compost out", category: "household", unit: "minutes", default_value: 10, market_rate_usd_hr: 30, icon: "🌱" },
  { name: "Clean the cat litter", category: "household", unit: "minutes", default_value: 10, market_rate_usd_hr: 25, icon: "🐱" },
  { name: "Change cat water", category: "household", unit: "minutes", default_value: 5, market_rate_usd_hr: 25, icon: "💧" },
  { name: "Water the plants", category: "household", unit: "minutes", default_value: 15, market_rate_usd_hr: 25, icon: "🪴" },
  { name: "Grocery run", category: "household", unit: "minutes", default_value: 60, market_rate_usd_hr: 30, icon: "🛒" },
  { name: "Clean the kitchen", category: "household", unit: "minutes", default_value: 25, market_rate_usd_hr: 35, icon: "🫧" },
  { name: "Cook adult meal", category: "household", unit: "minutes", default_value: 45, market_rate_usd_hr: 40, icon: "👨‍🍳" },
  { name: "Clean bathroom", category: "household", unit: "minutes", default_value: 20, market_rate_usd_hr: 35, icon: "🚿" },
  { name: "Mop floors", category: "household", unit: "minutes", default_value: 25, market_rate_usd_hr: 35, icon: "🧽" },

  // === COVERAGE (hours) ===
  { name: "Solo parenting — partner out", category: "coverage", unit: "hours", default_value: 3, icon: "🕐" },
  { name: "Solo parenting — partner working", category: "coverage", unit: "hours", default_value: 8, icon: "💼" },
  { name: "Solo parenting — partner socializing", category: "coverage", unit: "hours", default_value: 3, icon: "👋" },
  { name: "Solo parenting — partner resting", category: "coverage", unit: "hours", default_value: 1, icon: "😴" },
];
