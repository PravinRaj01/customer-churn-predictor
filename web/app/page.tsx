"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChurnConsole } from "@/components/inputs/ChurnConsole";
import { ChurnBarrel } from "@/components/churn/ChurnBarrel";
import { ResultCard } from "@/components/result/ResultCard";
import { Button } from "@/components/ui/Button";
import { usePrediction } from "@/hooks/usePrediction";
import { useWarmBackend } from "@/hooks/useWarmBackend";

export default function Home() {
  useWarmBackend();
  const { phase, data, error, submit, retry } = usePrediction();
  const isBusy = phase === "pouring" || phase === "churning" || phase === "breaking";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-16 sm:py-24">
      <header className="text-center">
        <p className="text-[0.8125rem] font-medium uppercase tracking-wide text-butter-700">
          Customer Churn Predictor
        </p>
        <h1 className="mt-1 font-display text-[clamp(2.5rem,6vw,4rem)] text-ink-900">
          Will they churn?
        </h1>
        <p className="mt-3 text-ink-500">
          Four numbers. One turn of the crank.
        </p>
      </header>

      <ChurnConsole onSubmit={submit} isSubmitting={isBusy} />

      <AnimatePresence mode="wait">
        {isBusy && (
          <motion.div
            key="barrel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChurnBarrel phase={phase} />
          </motion.div>
        )}

        {phase === "jammed" && (
          <motion.div
            key="jammed"
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-sour-400/40 bg-sour-400/10 px-6 py-4 text-center text-sepia-800"
          >
            <p className="font-display text-lg">The churn jammed.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button variant="ghost" onClick={retry} className="mt-3">
              Try again
            </Button>
          </motion.div>
        )}

        {phase === "settled" && data && (
          <motion.div
            key="result"
            role="status"
            aria-live="polite"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            <ResultCard result={data} />
          </motion.div>
        )}

        {phase === "idle" && (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-ink-500 italic"
          >
            The barrel&apos;s empty. Set the dials and give it a turn.
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
