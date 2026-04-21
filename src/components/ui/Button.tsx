import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const styles = {
  primary: "bg-warm-500 text-white hover:bg-warm-600 disabled:opacity-40",
  secondary: "bg-sand-100 text-bark hover:bg-sand-200",
  ghost: "text-sand-700 hover:bg-sand-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3.5 text-base rounded-xl",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`font-medium transition-all ${styles[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
