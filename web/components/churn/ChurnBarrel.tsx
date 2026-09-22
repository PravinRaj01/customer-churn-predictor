"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { ChurnPhase } from "@/lib/types";
import { ease, spring } from "@/lib/motion";
import { buildCreamPath } from "./CreamSurface";
import { CrankHandle } from "./CrankHandle";

const CREAM_FLOOR_Y = 190;
const CREAM_EMPTY_Y = 186;
const CREAM_FULL_Y = 112;
const CHURN_TARGET_VELOCITY = 2.4; // rad/s, steady-state once churning
const MAX_DRAG_VELOCITY = 6; // rad/s cap on user-added spin
const FRICTION = 0.995; // per-frame decay, lets added spin bleed off

const PHASE_LABEL: Partial<Record<ChurnPhase, string>> = {
  pouring: "Pouring the cream…",
  churning: "Working the cream…",
  breaking: "The butter breaks.",
};

// Progressive copy while churning: the first swap (1.6s) matches
// usePrediction's minimum dwell, so it's never seen on a fast response.
// The second (8s) only fires on a free-tier cold start — most requests
// resolve well before it, but when the backend has been asleep, saying so
// keeps a 30-60s wait from reading as the app having silently broken.
const CHURNING_COPY = [
  "Working the cream…",
  "Watching for the break…",
  "The barrel was cold — still waking it…",
] as const;

interface ChurnBarrelProps {
  phase: ChurnPhase;
}

/**
 * The centerpiece loading state: an old-school barrel churn that pours,
 * cranks and breaks in step with the real request (usePrediction owns the
 * phase; this component is a pure function of it). See
 * docs/BUTTER_CHURN_BLUEPRINT.md §2.1.
 *
 * Crank rotation and cream sloshing are driven by directly mutating SVG
 * attributes on every animation frame via refs rather than React state —
 * neither value is ever read back by React, so going through state would
 * mean a re-render on every frame for nothing.
 */
export function ChurnBarrel({ phase }: ChurnBarrelProps) {
  const reduceMotion = useReducedMotion();

  const angle = useMotionValue(0);
  const velocityRef = useRef(0);
  const creamY = useMotionValue(CREAM_EMPTY_Y);
  const barrelScale = useMotionValue(0.96);

  const crankGroupRef = useRef<SVGGElement>(null);
  const frontPathRef = useRef<SVGPathElement>(null);
  const backPathRef = useRef<SVGPathElement>(null);
  const barrelGroupRef = useRef<SVGGElement>(null);

  const [copyStage, setCopyStage] = useState<0 | 1 | 2>(0);

  // Pour the cream in on entering "pouring"; the RAF loop below handles
  // the continuous crank/slosh across every other phase transition.
  useEffect(() => {
    if (phase !== "pouring") return;
    animate(creamY, CREAM_FULL_Y, spring.pour);
    animate(barrelScale, 1, { duration: 0.4, ease: ease.churn });
  }, [phase, creamY, barrelScale]);

  // Copy stage advances at 1.6s and 8s into churning. Resetting copyStage
  // in the cleanup (rather than at the start of the "pouring" effect
  // above) means it only ever changes outside of render, in response to
  // the phase actually leaving "churning" — see the set-state-in-effect
  // note this pattern works around, same as before.
  useEffect(() => {
    if (phase !== "churning") return;
    const t1 = setTimeout(() => setCopyStage(1), 1600);
    const t2 = setTimeout(() => setCopyStage(2), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setCopyStage(0);
    };
  }, [phase]);

  useAnimationFrame((time, delta) => {
    if (reduceMotion) return;
    const dt = Math.min(delta, 48); // clamp a stalled tab's first frame

    const target = phase === "churning" ? CHURN_TARGET_VELOCITY : 0;
    velocityRef.current += (target - velocityRef.current) * Math.min(dt / 500, 1);
    velocityRef.current *= FRICTION;
    angle.set(angle.get() + velocityRef.current * (dt / 1000));

    crankGroupRef.current?.setAttribute(
      "transform",
      `rotate(${(angle.get() * 180) / Math.PI} 90 40)`,
    );

    const amplitude = Math.min(Math.abs(velocityRef.current) * 3.2, 11);
    const t = time / 1000;
    const baseY = creamY.get();

    frontPathRef.current?.setAttribute(
      "d",
      buildCreamPath(baseY, amplitude, t, 0, CREAM_FLOOR_Y),
    );
    backPathRef.current?.setAttribute(
      "d",
      buildCreamPath(baseY, amplitude * 0.8, t, Math.PI, CREAM_FLOOR_Y),
    );
    barrelGroupRef.current?.setAttribute(
      "transform",
      `scale(${barrelScale.get()})`,
    );
  });

  function handleCrankDrag(info: PanInfo) {
    const delta = (info.delta.x - info.delta.y) * 0.015;
    velocityRef.current = Math.max(
      -MAX_DRAG_VELOCITY,
      Math.min(MAX_DRAG_VELOCITY, velocityRef.current + delta),
    );
  }

  const label = phase === "churning"
    ? CHURNING_COPY[copyStage]
    : (PHASE_LABEL[phase] ?? "");

  const isActive = phase === "pouring" || phase === "churning" || phase === "breaking";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <svg
        viewBox="0 0 180 220"
        className="h-56 w-48"
        role="img"
        aria-hidden="true"
        style={
          reduceMotion && isActive
            ? { animation: "churn-breathe 1.6s ease-in-out infinite" }
            : undefined
        }
      >
        <defs>
          <clipPath id="barrel-clip">
            <rect x="30" y="60" width="120" height="130" rx="10" />
          </clipPath>
        </defs>

        <g ref={barrelGroupRef} style={{ transformOrigin: "90px 125px" }}>
          <rect
            x="30"
            y="60"
            width="120"
            height="130"
            rx="14"
            fill="var(--color-cream-100)"
            stroke="var(--color-cream-300)"
            strokeWidth="2"
          />

          <g clipPath="url(#barrel-clip)">
            <path
              ref={backPathRef}
              d={buildCreamPath(CREAM_EMPTY_Y, 0, 0, Math.PI, CREAM_FLOOR_Y)}
              fill="var(--color-butter-300)"
              opacity="0.5"
            />
            <path
              ref={frontPathRef}
              d={buildCreamPath(CREAM_EMPTY_Y, 0, 0, 0, CREAM_FLOOR_Y)}
              fill="var(--color-butter-400)"
            />
          </g>

          {[54, 78, 102, 126].map((x) => (
            <line
              key={x}
              x1={x}
              y1="60"
              x2={x}
              y2="190"
              stroke="var(--color-cream-300)"
              strokeWidth="1.5"
            />
          ))}
          <rect x="30" y="96" width="120" height="6" fill="var(--color-butter-600)" opacity="0.4" />
          <rect x="30" y="150" width="120" height="6" fill="var(--color-butter-600)" opacity="0.4" />

          <rect x="24" y="48" width="132" height="16" rx="8" fill="var(--color-cream-300)" />
        </g>

        {/* Crank sits outside the scaled barrel group so its own rotation
            math stays independent of the barrel's entrance scale. */}
        <g ref={crankGroupRef} style={{ transformOrigin: "90px 40px" }}>
          <circle cx="90" cy="40" r="6" fill="var(--color-ink-700)" />
          <CrankHandle onDrag={handleCrankDrag} />
        </g>
      </svg>

      {reduceMotion && isActive && (
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full w-1/3 rounded-full bg-butter-500"
            style={{ animation: "churn-indeterminate 1.2s ease-in-out infinite" }}
          />
        </div>
      )}

      <p className="min-h-[1.5rem] font-display text-lg text-ink-700" aria-live="polite">
        {label}
      </p>
    </div>
  );
}
