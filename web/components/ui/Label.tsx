import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[0.8125rem] font-medium uppercase tracking-wide text-ink-500",
        className,
      )}
      {...props}
    />
  );
}
