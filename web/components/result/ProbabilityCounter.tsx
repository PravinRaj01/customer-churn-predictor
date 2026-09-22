"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ease } from "@/lib/motion";

/**
 * The hero probability figure, counting up from 0 on mount. Always
 * ink-900, even in the curdled state — the theme colors the container,
 * never the data itself.
 */
export function ProbabilityCounter({ fraction }: { fraction: number }) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? fraction * 100 : 0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(count, fraction * 100, {
      duration: 0.9,
      ease: ease.churn,
    });
    return () => controls.stop();
  }, [fraction, count, reduceMotion]);

  return (
    <span className="font-display tnum text-ink-900 text-[clamp(4rem,12vw,7rem)] leading-none">
      <motion.span>{rounded}</motion.span>
      <span className="text-[0.4em] align-top text-ink-500">%</span>
    </span>
  );
}
