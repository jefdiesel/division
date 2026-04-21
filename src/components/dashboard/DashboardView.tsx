import { useState, useMemo } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Spinner } from "@/components/ui/Spinner";
import { SplitBar } from "@/components/ui/SplitBar";
import { Card } from "@/components/ui/Card";
import { CategorySplit } from "./CategorySplit";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { useEntries, type Entry } from "@/lib/hooks/useEntries";
import { CATEGORIES, type CategoryType } from "@/lib/constants";

type Period = "week" | "month";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function periodStart(period: Period): string {
  const now = new Date();
  if (period === "week") {
    const day = now.getDay();
    // Start from Monday
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }
  // Month
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return first.toISOString();
}

interface SplitData {
  value1: number;
  value2: number;
  dollars1: number;
  dollars2: number;
}

function computeSplits(
  entries: Entry[],
  userId1: string,
  userId2: string
): Record<CategoryType, SplitData> {
  const result: Record<CategoryType, SplitData> = {
    childcare: { value1: 0, value2: 0, dollars1: 0, dollars2: 0 },
    household: { value1: 0, value2: 0, dollars1: 0, dollars2: 0 },
    coverage: { value1: 0, value2: 0, dollars1: 0, dollars2: 0 },
  };

  for (const entry of entries) {
    const cat = entry.task_templates?.category as CategoryType | undefined;
    if (!cat || !result[cat]) continue;

    const isUser1 = entry.user_id === userId1;
    if (isUser1) {
      result[cat].value1 += entry.value;
    } else if (entry.user_id === userId2) {
      result[cat].value2 += entry.value;
    }

    // Compute dollar equivalent for household tasks
    if (cat === "household" && entry.task_templates?.market_rate_usd_hr) {
      const hours = entry.value / 60; // household is in minutes
      const dollarValue = hours * entry.task_templates.market_rate_usd_hr;
      if (isUser1) {
        result[cat].dollars1 += dollarValue;
      } else {
        result[cat].dollars2 += dollarValue;
      }
    }
  }

  return result;
}

export function DashboardView() {
  const { user } = useAuth();
  const { data: householdData } = useHousehold();
  const household = householdData?.household;
  const members = householdData?.members ?? [];
  const householdId = household?.id;

  const [period, setPeriod] = useState<Period>("week");
  const since = useMemo(() => periodStart(period), [period]);

  const { data: entries, isLoading } = useEntries(householdId, since);

  // Determine the two parents, current user first
  const me = members.find((m) => m.user_id === user?.id);
  const partner = members.find((m) => m.user_id !== user?.id);

  const splits = useMemo(() => {
    if (!entries || !me || !partner) return null;
    return computeSplits(entries, me.user_id, partner.user_id);
  }, [entries, me, partner]);

  if (!householdId || !me || !partner) {
    return <Spinner className="py-20" />;
  }

  // Compute overall totals for the summary bar.
  // Weight each category equally by converting to a 0-1 ratio, then averaging.
  const overallValues = useMemo(() => {
    if (!splits) return { v1: 0, v2: 0 };
    const categories: CategoryType[] = ["childcare", "household", "coverage"];
    let totalRatio1 = 0;
    let counted = 0;
    for (const cat of categories) {
      const s = splits[cat];
      const total = s.value1 + s.value2;
      if (total > 0) {
        totalRatio1 += s.value1 / total;
        counted++;
      }
    }
    if (counted === 0) return { v1: 50, v2: 50 };
    const avg = totalRatio1 / counted;
    return { v1: Math.round(avg * 100), v2: Math.round((1 - avg) * 100) };
  }, [splits]);

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold text-bark">Dashboard</h1>
      </div>

      {/* Period selector */}
      <div className="mb-5">
        <SegmentedControl
          options={PERIOD_OPTIONS}
          selected={period}
          onChange={setPeriod}
        />
      </div>

      {isLoading || !splits ? (
        <Spinner className="py-12" />
      ) : (
        <div className="space-y-3">
          {/* Per-category splits */}
          {(["childcare", "household", "coverage"] as CategoryType[]).map(
            (cat) => (
              <CategorySplit
                key={cat}
                category={cat}
                parent1Name={me.display_name}
                parent2Name={partner.display_name}
                value1={splits[cat].value1}
                value2={splits[cat].value2}
                dollarTotal1={
                  cat === "household"
                    ? Math.round(splits[cat].dollars1)
                    : undefined
                }
                dollarTotal2={
                  cat === "household"
                    ? Math.round(splits[cat].dollars2)
                    : undefined
                }
              />
            )
          )}

          {/* Overall summary */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-bark mb-3">
              Overall Split
            </h3>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-sand-600">{me.display_name}</span>
              <span className="text-xs text-sand-600">
                {partner.display_name}
              </span>
            </div>
            <SplitBar
              value1={overallValues.v1}
              value2={overallValues.v2}
            />
            <p className="text-[11px] text-sand-400 text-center mt-2">
              Average across all categories with entries
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
