interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, selected, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-sand-100">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            selected === opt.value
              ? "bg-white text-bark shadow-[0_1px_2px_rgba(61,46,31,0.08)]"
              : "text-sand-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
