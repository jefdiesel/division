interface SplitBarProps {
  value1: number;
  value2: number;
  label1?: string;
  label2?: string;
}

export function SplitBar({ value1, value2, label1, label2 }: SplitBarProps) {
  const total = value1 + value2;
  if (total === 0) return null;
  const pct1 = Math.round((value1 / total) * 100);
  const pct2 = 100 - pct1;

  return (
    <div className="space-y-2">
      {(label1 || label2) && (
        <div className="flex justify-between text-xs text-sand-700">
          <span>{label1}</span>
          <span>{label2}</span>
        </div>
      )}
      <div className="flex h-3 rounded-full overflow-hidden bg-sand-100">
        <div
          className="transition-all duration-500 rounded-l-full"
          style={{ width: `${pct1}%`, background: "#d4a574" }}
        />
        <div
          className="transition-all duration-500 rounded-r-full"
          style={{ width: `${pct2}%`, background: "#8b9d83" }}
        />
      </div>
      <div className="flex justify-between text-sm font-semibold text-sand-800">
        <span>{pct1}</span>
        <span>{pct2}</span>
      </div>
    </div>
  );
}
