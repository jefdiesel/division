import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(61,46,31,0.08)] ${className}`}
      {...props}
    />
  );
}
