"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease, spring } from "@/lib/motion";

const DROPLETS = [
  { x: -46, y: -18, r: 5, delay: 0.5 },
  { x: 44, y: -22, r: 4, delay: 0.55 },
  { x: -52, y: 20, r: 6, delay: 0.6 },
  { x: 50, y: 24, r: 4, delay: 0.65 },
  { x: -20, y: -42, r: 3, delay: 0.7 },
  { x: 22, y: 44, r: 5, delay: 0.75 },
];

// A squat dome sitting on a flatter base — closer to an actual pat of
// butter than a plain oval. The three "ridge" bands mimic the grooves a
// wooden butter paddle presses into the top when it's shaped, which ties
// it back to the churn itself rather than leaving it a generic blob.
const PAT_RADIUS = "50% 50% 46% 46% / 68% 68% 32% 32%";

/**
 * The "Perfect Churn" success visual — a butter pat forms, catches one
 * pass of light (never looped, or it reads as a shimmer GIF), blooms with
 * warmth, and a handful of gold droplets settle around it.
 * See docs/BUTTER_CHURN_BLUEPRINT.md §2.4.
 */
export function ButterPat() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-32 w-full items-center justify-center">
      {/* Warmth bloom */}
      {!reduceMotion && (
        <motion.div
          className="absolute h-24 w-24 rounded-full bg-butter-300/25"
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      )}

      {/* Droplets */}
      {!reduceMotion &&
        DROPLETS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-butter-500"
            style={{ width: d.r * 2, height: d.r * 2 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1.4 }}
            animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.9 }}
            transition={{ ...spring.pour, delay: d.delay }}
          />
        ))}

      {/* The pat itself */}
      <motion.div
        className="relative h-16 w-32 bg-gradient-to-br from-butter-300 via-butter-400 to-butter-600"
        style={{
          borderRadius: PAT_RADIUS,
          filter: "drop-shadow(0 10px 14px rgba(157,102,8,0.4))",
        }}
        initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: ease.churn }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: PAT_RADIUS }}
        >
          {/* Glossy sheen, upper-left — gives the surface a waxy read even
              before the specular sweep passes over it. */}
          <div className="absolute -left-2 -top-4 h-14 w-20 rounded-full bg-white/25 blur-sm" />

          {/* Paddle-pressed ridges */}
          <div className="absolute left-1/2 top-4 h-[3px] w-[55%] -translate-x-1/2 rounded-full bg-butter-700/20" />
          <div className="absolute left-1/2 top-8 h-[3px] w-[68%] -translate-x-1/2 rounded-full bg-butter-700/15" />
          <div className="absolute left-1/2 top-[46px] h-[3px] w-[80%] -translate-x-1/2 rounded-full bg-butter-700/10" />

          {!reduceMotion && (
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              initial={{ x: "-140%" }}
              animate={{ x: "340%" }}
              transition={{ duration: 0.9, delay: 0.35, ease: "easeInOut" }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
