"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Label } from "@/components/ui/Label";
import { formatTenure } from "@/lib/format";
import { spring as springPresets } from "@/lib/motion";

interface TenureSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN = 0;
const MAX = 72;
const TICKS = [0, 12, 24, 36, 48, 60, 72];
const MAX_SQUASH_VELOCITY = 1800; // px/s equivalent, empirically tuned
const MAX_SQUASH = 0.28;

/**
 * "Time in the Churn" — the tenure slider (0-72 months).
 *
 * The native <input type="range"> stays authoritative for value + a11y;
 * its own thumb is hidden and a decorative overlay (fill + butter-pat
 * thumb) trails it through a spring so the visual reads as liquid
 * catching up with the hand, complete with squash/stretch on drag
 * velocity and a gooey SVG merge between thumb and fill.
 * See docs/BUTTER_CHURN_BLUEPRINT.md §2.2.
 */
export function TenureSlider({ value, onChange }: TenureSliderProps) {
  const reduceMotion = useReducedMotion();
  const raw = useMotionValue(value);
  const lastTickRef = useRef(Math.floor(value / 12));

  useEffect(() => {
    raw.set(value);

    const tick = Math.floor(value / 12);
    if (tick !== lastTickRef.current && value % 12 === 0) {
      navigator.vibrate?.(8);
    }
    lastTickRef.current = tick;
  }, [value, raw]);

  const springValue = useSpring(raw, springPresets.butter);
  const velocity = useVelocity(springValue);

  // Under reduced motion, read straight off the raw value instead of the
  // spring-trailed one, so the fill/thumb snap to the pointer rather than
  // visibly lagging it.
  const displayValue = reduceMotion ? raw : springValue;
  const percent = useTransform(displayValue, (v) => ((v - MIN) / (MAX - MIN)) * 100);
  const leftPercent = useTransform(percent, (p) => `${p}%`);
  const fillWidth = useTransform(percent, (p) => `${p}%`);

  const scaleX = useTransform(velocity, (v) => {
    if (reduceMotion) return 1;
    return 1 + (Math.min(Math.abs(v), MAX_SQUASH_VELOCITY) / MAX_SQUASH_VELOCITY) * MAX_SQUASH;
  });
  const scaleY = useTransform(scaleX, (s) => 1 / s);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <Label htmlFor="tenure">Time in the Churn</Label>
        <span className="font-display text-lg text-ink-900 tnum">
          {formatTenure(value)}
        </span>
      </div>

      {/* Extra vertical padding gives the goo blur a gutter so it doesn't clip. */}
      <div className="relative py-3">
        <input
          id="tenure"
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="tenure-slider tenure-slider--ghost"
          aria-valuetext={formatTenure(value)}
        />

        {/* Gooey merge: blur + high-contrast alpha step fuses the thumb
            into the fill instead of letting it sit on top as two shapes. */}
        <svg width="0" height="0" aria-hidden="true">
          <filter id="tenure-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>

        {/* The goo filter is a static visual effect, not motion, so it's
            applied unconditionally regardless of reduced-motion — and
            because useReducedMotion() is null during SSR, branching this
            style on it would make the server/client markup disagree. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: "url(#tenure-goo)" }}
        >
          <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-cream-200" />
          <motion.div
            className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-cream-300 via-butter-300 to-butter-500"
            style={{ width: fillWidth }}
          />
          <motion.div
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-butter-600/30 bg-butter-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            style={{ left: leftPercent, scaleX, scaleY }}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between px-0.5">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="font-mono text-[10px] text-ink-500 tnum transition-transform duration-150"
            style={{
              transform:
                Math.abs(value - tick) < 0.5 ? "scale(1.15)" : "scale(1)",
            }}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}
