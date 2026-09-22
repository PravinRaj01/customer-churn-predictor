import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * The "churn console" surface — a double shadow (hard 2px + wide soft) is
 * what sells physical, milled wood rather than a flat web card.
 * See docs/BUTTER_CHURN_BLUEPRINT.md §1.4.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-surface border border-border",
        "shadow-[0_2px_0_var(--color-cream-300),0_24px_48px_-24px_rgba(26,23,18,0.18)]",
        className,
      )}
      {...props}
    />
  );
}
