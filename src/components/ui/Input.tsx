import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-bark mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 text-bark text-base focus:outline-none focus:ring-2 focus:ring-warm-400 ${className}`}
        {...props}
      />
    </div>
  );
}
