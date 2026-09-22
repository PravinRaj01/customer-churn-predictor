"use client";

import { motion, PanInfo, useReducedMotion } from "motion/react";

interface CrankHandleProps {
  onDrag: (info: PanInfo) => void;
}

/**
 * The draggable crank handle. Spinning it faster speeds the sloshing and
 * dasher rod — purely a toy, not on the critical path to the result — but
 * it turns an unavoidable wait into something to do with your hands.
 * Disabled entirely under prefers-reduced-motion.
 */
export function CrankHandle({ onDrag }: CrankHandleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.g
      drag={!reduceMotion}
      dragMomentum={false}
      dragElastic={0}
      onDrag={(_, info) => onDrag(info)}
      style={{ cursor: reduceMotion ? "default" : "grab" }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <title>Drag to churn faster</title>
      <line
        x1="90"
        y1="40"
        x2="120"
        y2="20"
        stroke="var(--color-ink-700)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="20"
        r="8"
        fill="var(--color-butter-500)"
        stroke="var(--color-butter-700)"
        strokeWidth="2"
      />
    </motion.g>
  );
}
