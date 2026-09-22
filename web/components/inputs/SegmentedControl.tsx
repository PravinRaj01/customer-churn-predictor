"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

/**
 * Generic 3-way segmented control, used for both Contract and Internet
 * Service. Each option maps 1:1 to a one-hot column, so a segmented
 * control shows the whole decision space rather than hiding two of three
 * choices behind a dropdown click.
 *
 * The active pill is a separate absolutely-positioned motion.div, measured
 * against the active button's actual box (rather than assumed thirds) so
 * it tracks correctly regardless of label width or gap rounding, then
 * springs to its new position with `spring.pat` — enough overshoot to
 * feel like it lands. See docs/BUTTER_CHURN_BLUEPRINT.md §2.2.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  name,
}: SegmentedControlProps<T>) {
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [pillRect, setPillRect] = useState<{ left: number; width: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const button = buttonRefs.current.get(value);
    const rail = railRef.current;
    if (!button || !rail) return;

    const measure = () =>
      setPillRect({ left: button.offsetLeft, width: button.offsetWidth });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [value, options]);

  const labelId = `${name}-label`;

  return (
    <div>
      <span
        id={labelId}
        className="mb-2 block text-[0.8125rem] font-medium uppercase tracking-wide text-ink-500"
      >
        {label}
      </span>

      {/* Below 380px, three pills get cramped — a native select covers
          the same options with guaranteed touch-target size and needs no
          separate a11y wiring of its own. See blueprint §1.4. */}
      <select
        aria-labelledby={labelId}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="block min-[380px]:hidden w-full rounded-2xl border border-border bg-cream-200 px-4 py-3 text-sm font-medium text-ink-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div
        ref={railRef}
        role="radiogroup"
        aria-labelledby={labelId}
        className="relative hidden min-[380px]:grid grid-cols-3 gap-1 rounded-2xl border border-border bg-cream-200 p-1"
      >
        {pillRect && (
          <motion.div
            layout={!reduceMotion}
            className="absolute inset-y-1 rounded-xl bg-butter-500 shadow-[0_2px_8px_-2px_rgba(232,163,23,0.35)]"
            initial={false}
            animate={{ left: pillRect.left, width: pillRect.width }}
            transition={reduceMotion ? { duration: 0 } : spring.pat}
          />
        )}

        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              ref={(el) => {
                if (el) buttonRefs.current.set(option, el);
                else buttonRefs.current.delete(option);
              }}
              type="button"
              role="radio"
              aria-checked={active}
              name={name}
              onClick={() => onChange(option)}
              className={cn(
                "relative z-10 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25",
                active ? "text-ink-on-gold" : "text-ink-500 hover:text-ink-900",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
