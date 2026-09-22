import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { RiskBand } from "@/lib/types";

const BAND_STYLES: Record<RiskBand, string> = {
  creamy: "bg-butter-300/25 border-butter-500/40 text-butter-700",
  steady: "bg-butter-300/20 border-butter-500/30 text-butter-700",
  curdling: "bg-sour-400/15 border-sour-400/40 text-sepia-800",
  spoiled: "bg-sour-400/20 border-sepia-600/50 text-sepia-800",
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  band: RiskBand;
}

export function Chip({ band, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
        BAND_STYLES[band],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
