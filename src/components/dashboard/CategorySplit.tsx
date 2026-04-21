import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { SplitBar } from "@/components/ui/SplitBar";
import { formatDuration, formatDollars, type CategoryType, type UnitType, CATEGORIES } from "@/lib/constants";

interface CategorySplitProps {
  category: CategoryType;
  parent1Name: string;
  parent2Name: string;
  value1: number;
  value2: number;
  /** For household category: total dollar value at market rates (in dollars, not cents). */
  dollarTotal1?: number;
  dollarTotal2?: number;
}

export function CategorySplit({
  category,
  parent1Name,
  parent2Name,
  value1,
  value2,
  dollarTotal1,
  dollarTotal2,
}: CategorySplitProps) {
  const cat = CATEGORIES[category];
  const unit: UnitType = cat.unit;
  const isEmpty = value1 === 0 && value2 === 0;

  // Hover state for revealing dollar amounts on household category
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className="p-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Category label with color dot */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: cat.color }}
        />
        <h3 className="text-sm font-semibold text-bark">{cat.label}</h3>
      </div>

      {isEmpty ? (
        <p className="text-xs text-sand-400 py-2">No entries this period.</p>
      ) : (
        <>
          {/* Values row */}
          <div className="flex justify-between items-baseline mb-2">
            <div className="text-left">
              <span className="text-sm font-semibold text-sand-800">
                {formatDuration(value1, unit)}
              </span>
              <span className="text-xs text-sand-500 ml-1.5">
                {parent1Name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-sand-500 mr-1.5">
                {parent2Name}
              </span>
              <span className="text-sm font-semibold text-sand-800">
                {formatDuration(value2, unit)}
              </span>
            </div>
          </div>

          {/* Split bar */}
          <SplitBar value1={value1} value2={value2} />

          {/* Dollar value for household: subtle, shown on hover only */}
          {category === "household" &&
            hovered &&
            (dollarTotal1 != null || dollarTotal2 != null) && (
              <div className="flex justify-between mt-2 text-[11px] text-sand-400 transition-opacity">
                <span>
                  {dollarTotal1 != null ? formatDollars(dollarTotal1) : ""}
                </span>
                <span className="text-sand-300">at agreed rates</span>
                <span>
                  {dollarTotal2 != null ? formatDollars(dollarTotal2) : ""}
                </span>
              </div>
            )}
        </>
      )}
    </Card>
  );
}
