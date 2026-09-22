import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5",
        "text-base font-semibold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variant === "primary" &&
          "bg-butter-500 text-ink-on-gold hover:bg-butter-600 shadow-[0_2px_0_var(--color-butter-700),0_8px_20px_-8px_rgba(232,163,23,0.5)]",
        variant === "ghost" &&
          "bg-transparent text-ink-500 hover:text-ink-900 hover:bg-cream-200",
        className,
      )}
      {...props}
    />
  );
}
