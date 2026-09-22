"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import { RiskBand } from "@/lib/types";

interface RiskArcProps {
  fraction: number; // 0-1, the value to show (churn or retention probability)
  band: RiskBand;
}

// 240° gauge: starts at -210deg, sweeps 240deg. Path length precomputed
// for a circle of radius 80 at that sweep angle.
const RADIUS = 80;
const SWEEP_DEG = 240;
const ARC_LENGTH = (2 * Math.PI * RADIUS * SWEEP_DEG) / 360;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GRADIENT_STOPS: Record<RiskBand, [string, string]> = {
  creamy: ["var(--color-cream-300)", "var(--color-butter-500)"],
  steady: ["var(--color-cream-300)", "var(--color-butter-600)"],
  curdling: ["var(--color-cream-300)", "var(--color-sour-400)"],
  spoiled: ["var(--color-sour-400)", "var(--color-sepia-600)"],
};

/**
 * 240° arc gauge. Sweeps from empty to the target fraction over 900ms
 * with the house ease.churn curve, starting 250ms after mount so the
 * card container visibly arrives first. See blueprint §2.3/§2.4.
 */
export function RiskArc({ fraction, band }: RiskArcProps) {
  const reduceMotion = useReducedMotion();
  const targetOffset = ARC_LENGTH * (1 - fraction);
  const [from, to] = GRADIENT_STOPS[band];
  const gradientId = `risk-arc-gradient-${band}`;

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-48 w-48"
      role="img"
      aria-label={`${Math.round(fraction * 100)} percent`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx="100"
        cy="100"
        r={RADIUS}
        fill="none"
        stroke="var(--color-cream-200)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
        transform="rotate(150 100 100)"
      />
      {/* Value */}
      <motion.circle
        cx="100"
        cy="100"
        r={RADIUS}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
        transform="rotate(150 100 100)"
        initial={reduceMotion ? false : { strokeDashoffset: ARC_LENGTH }}
        animate={{ strokeDashoffset: targetOffset }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.9, ease: ease.churn, delay: 0.25 }
        }
      />
    </svg>
  );
}
