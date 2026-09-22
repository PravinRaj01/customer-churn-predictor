"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

interface ChargesFieldProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN = 0;
const MAX = 150;
const STEP = 0.5;

/**
 * "The Cream Line" — Monthly Charges (0-150). A cream-level fill rises
 * behind the number as the value grows, instead of a plain numeric input.
 *
 * Phase 2: fill height is a static CSS percentage. Phase 3 animates it
 * with a spring so it sloshes rather than jumps, and gives each digit its
 * own odometer-roll transition (see blueprint §2.2).
 */
export function ChargesField({ value, onChange }: ChargesFieldProps) {
  const [draft, setDraft] = useState(value.toFixed(2));

  const fillPercent = Math.min(100, Math.max(0, (value / MAX) * 100));

  function commit(next: number) {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    onChange(clamped);
    setDraft(clamped.toFixed(2));
  }

  function step(delta: number) {
    commit(Math.round((value + delta) / STEP) * STEP);
  }

  return (
    <div>
      <Label htmlFor="monthly-charges">The Cream Line</Label>

      <div className="relative mt-2 overflow-hidden rounded-2xl border border-border bg-cream-200">
        {/* Cream fill — the "meniscus" */}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-butter-300/45 to-transparent transition-[height] duration-300"
          style={{ height: `${fillPercent}%` }}
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-butter-500/60" />
        </div>

        <div className="relative flex items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => step(-STEP)}
            aria-label="Decrease monthly charges by 50 cents"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cream-100/80 text-ink-700 transition hover:bg-cream-300 active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25"
          >
            −
          </button>

          <span className="font-mono text-ink-500">$</span>
          <input
            id="monthly-charges"
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const parsed = parseFloat(draft);
              commit(Number.isFinite(parsed) ? parsed : value);
            }}
            className={cn(
              "font-display tnum w-full rounded-lg bg-transparent text-4xl text-ink-900",
              "outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25",
            )}
          />

          <button
            type="button"
            onClick={() => step(STEP)}
            aria-label="Increase monthly charges by 50 cents"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cream-100/80 text-ink-700 transition hover:bg-cream-300 active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-butter-500/25"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
