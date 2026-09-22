"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

interface ChargesFieldProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN = 0;
const MAX = 150;
const STEP = 0.5;
const CLAMP_MESSAGE_MS = 2200;

/**
 * "The Cream Line" — Monthly Charges (0-150). A cream-level fill rises
 * behind the number as the value grows, instead of a plain numeric input.
 *
 * Phase 2: fill height is a static CSS percentage. Phase 3 animates it
 * with a spring so it sloshes rather than jumps, and gives each digit its
 * own odometer-roll transition (see blueprint §2.2).
 */
export function ChargesField({ value, onChange }: ChargesFieldProps) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState(value.toFixed(2));
  const [clampMessage, setClampMessage] = useState<string | null>(null);
  const clampTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeControls = useAnimationControls();

  const fillPercent = Math.min(100, Math.max(0, (value / MAX) * 100));

  function commit(next: number) {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    onChange(clamped);
    setDraft(clamped.toFixed(2));

    // Only surface feedback when the raw input actually exceeded the
    // range — not on ordinary re-formatting of an already-valid number
    // (e.g. "50" -> "50.00").
    if (clamped !== next) {
      if (clampTimeoutRef.current) clearTimeout(clampTimeoutRef.current);
      setClampMessage(`Capped at $${clamped.toFixed(2)}`);
      clampTimeoutRef.current = setTimeout(
        () => setClampMessage(null),
        CLAMP_MESSAGE_MS,
      );

      if (!reduceMotion) {
        shakeControls.start({
          x: [0, -6, 6, -4, 4, 0],
          transition: { duration: 0.35, ease: "easeInOut" },
        });
      } else {
        // No horizontal motion under reduced-motion, but still give a
        // brief non-color cue via a quick opacity pulse on the border.
        shakeControls.start({ opacity: [1, 0.7, 1], transition: { duration: 0.3 } });
      }
    }
  }

  function step(delta: number) {
    commit(Math.round((value + delta) / STEP) * STEP);
  }

  useEffect(() => {
    return () => {
      if (clampTimeoutRef.current) clearTimeout(clampTimeoutRef.current);
    };
  }, []);

  return (
    <div>
      <Label htmlFor="monthly-charges">The Cream Line</Label>
      <p className="mt-0.5 text-xs text-ink-500">Monthly charges, in dollars</p>

      <motion.div
        animate={shakeControls}
        className={cn(
          "relative mt-2 overflow-hidden rounded-2xl border bg-cream-200 transition-colors duration-300",
          clampMessage ? "border-sour-400" : "border-border",
        )}
      >
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
            onChange={(e) => {
              const next = e.target.value;
              setDraft(next);
              // Sync the parent on every keystroke that already parses,
              // not just on blur. Pressing Enter inside a <form> submits
              // natively without ever firing blur, so if the parent's
              // value only ever updated on blur, Enter would submit
              // whatever was typed *before* this edit. Clamping is still
              // deferred to commit() below, so typing "1" on the way to
              // "100" is never blocked mid-keystroke.
              const parsed = parseFloat(next);
              if (Number.isFinite(parsed)) onChange(parsed);
            }}
            onBlur={() => {
              const parsed = parseFloat(draft);
              commit(Number.isFinite(parsed) ? parsed : value);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              // Enter commits/formats the value only — it must not also
              // submit the form. preventDefault stops the native
              // implicit submission a text input triggers on Enter
              // inside a <form>; only the "Churn It" button should ever
              // start a prediction.
              e.preventDefault();
              const parsed = parseFloat(draft);
              commit(Number.isFinite(parsed) ? parsed : value);
            }}
            aria-describedby={clampMessage ? "monthly-charges-clamp" : undefined}
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
      </motion.div>

      <AnimatePresence>
        {clampMessage && (
          <motion.p
            id="monthly-charges-clamp"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs text-sepia-800"
          >
            {clampMessage} — that&apos;s the field&apos;s range.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
