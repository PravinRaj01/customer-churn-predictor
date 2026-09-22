"use client";

import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

const CURDS = [
  { x: -34, y: -20, r: 8, delay: 0 },
  { x: 30, y: -26, r: 6, delay: 0.06 },
  { x: -42, y: 10, r: 5, delay: 0.12 },
  { x: 36, y: 16, r: 7, delay: 0.18 },
  { x: -8, y: -34, r: 4, delay: 0.24 },
  { x: 10, y: 28, r: 5, delay: 0.3 },
];

/**
 * The "Curdle" high-risk visual — cream separating into whey and lumps of
 * curd, urgent through texture rather than red. Sits opposite ButterPat
 * in ResultCard. See docs/BUTTER_CHURN_BLUEPRINT.md §2.3.
 */
export function CurdleBlob() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-32 w-full items-center justify-center">
      <motion.div
        className="relative h-20 w-28 rounded-[35%] bg-whey-300"
        initial={reduceMotion ? false : { opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
      />

      {!reduceMotion &&
        CURDS.map((c, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-sepia-600/40"
            style={{ width: c.r * 2, height: c.r * 2 }}
            initial={{ x: c.x, y: c.y - 30, opacity: 0 }}
            animate={{ x: c.x, y: c.y, opacity: 1 }}
            transition={{ ...spring.pour, delay: c.delay }}
          />
        ))}
    </div>
  );
}
