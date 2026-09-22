"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ButterPat } from "@/components/churn/ButterPat";
import { CurdleBlob } from "@/components/churn/CurdleBlob";
import { PredictResponse } from "@/lib/types";
import { ease, spring } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { RiskArc } from "./RiskArc";
import { ProbabilityCounter } from "./ProbabilityCounter";
import { Recommendations } from "./Recommendations";

const BAND_LABEL: Record<PredictResponse["risk_band"], string> = {
  creamy: "Creamy",
  steady: "Steady",
  curdling: "Curdling",
  spoiled: "Spoiled",
};

/**
 * High risk unrolls downward like butter paper (clip-path inset reveal);
 * low risk lands with a small physical pop. Both read as "arriving", just
 * with a different temperament. See docs/BUTTER_CHURN_BLUEPRINT.md §2.3/§2.4.
 */
export function ResultCard({ result }: { result: PredictResponse }) {
  const reduceMotion = useReducedMotion();
  const isHighRisk = result.prediction === 1;
  const heroFraction = isHighRisk
    ? result.churn_probability
    : result.retention_probability;

  // The page-wide grain texture subtly sours while a high-risk result is
  // on screen (see globals.css .grain-overlay / .grain-heavy).
  useEffect(() => {
    if (!isHighRisk) return;
    const overlay = document.querySelector(".grain-overlay");
    overlay?.classList.add("grain-heavy");
    return () => overlay?.classList.remove("grain-heavy");
  }, [isHighRisk]);

  const revealProps = reduceMotion
    ? {}
    : isHighRisk
      ? {
          initial: { clipPath: "inset(0 0 100% 0)" },
          animate: { clipPath: "inset(0 0 0% 0)" },
          transition: { duration: 0.5, ease: ease.churn },
        }
      : {
          initial: { scale: 0.97, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: spring.pat,
        };

  return (
    <motion.div {...revealProps}>
      <Card
        className={cn(
          "p-8",
          isHighRisk && "shadow-[0_2px_0_var(--color-cream-300),0_24px_48px_-24px_rgba(107,74,18,0.25)]",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink-900">
            {isHighRisk ? "The cream is turning." : "Churned to perfection."}
          </h2>
          <Chip band={result.risk_band} className={isHighRisk ? "chip-breathe" : undefined}>
            {BAND_LABEL[result.risk_band]}
          </Chip>
        </div>

        {isHighRisk ? <CurdleBlob /> : <ButterPat />}

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <RiskArc fraction={heroFraction} band={result.risk_band} />
            <div className="absolute inset-0 flex items-center justify-center">
              <ProbabilityCounter fraction={heroFraction} />
            </div>
          </div>
          <p className="text-center text-ink-500">
            {isHighRisk
              ? `${Math.round(result.churn_probability * 100)}% chance this customer walks.`
              : `${Math.round(result.retention_probability * 100)}% likely to stay.`}
          </p>
        </div>

        <Recommendations band={result.risk_band} />
      </Card>
    </motion.div>
  );
}
