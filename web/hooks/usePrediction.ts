"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { predictChurn, PredictionError } from "@/lib/api";
import { ChurnPhase, PredictRequest, PredictResponse } from "@/lib/types";

const POUR_MS = 400; // matches the barrel's cream-rise animation
const MIN_CHURN_MS = 1200; // floor so a ~15ms API response isn't a flash of noise
const BREAK_MS = 700; // matches the "butter breaks" settle animation

/**
 * The full churn phase machine (see lib/types.ts ChurnPhase and
 * docs/BUTTER_CHURN_BLUEPRINT.md §3.3). ChurnBarrel, the submit button and
 * ResultCard all read off `phase`/`data`/`error` from this single hook —
 * no component keeps a second copy of "are we loading".
 */
export function usePrediction() {
  const [phase, setPhase] = useState<ChurnPhase>("idle");
  const [data, setData] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingInput = useRef<PredictRequest | null>(null);

  const submit = useCallback((input: PredictRequest) => {
    pendingInput.current = input;
    setError(null);
    setPhase("pouring");
  }, []);

  const retry = useCallback(() => {
    if (pendingInput.current) submit(pendingInput.current);
  }, [submit]);

  const reset = useCallback(() => {
    setPhase("idle");
    setData(null);
    setError(null);
  }, []);

  // pouring -> churning, fixed duration (cream rise animation)
  useEffect(() => {
    if (phase !== "pouring") return;
    const t = setTimeout(() => setPhase("churning"), POUR_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // churning: fire the real request, held to a minimum dwell so the
  // animation always reads as deliberate rather than a flash.
  useEffect(() => {
    if (phase !== "churning") return;
    let cancelled = false;
    const input = pendingInput.current;
    if (!input) return;

    const minDwell = new Promise<void>((resolve) => setTimeout(resolve, MIN_CHURN_MS));
    const request = predictChurn(input);

    Promise.allSettled([request, minDwell]).then(([result]) => {
      if (cancelled) return;
      if (result.status === "fulfilled") {
        setData(result.value);
        setPhase("breaking");
      } else {
        const err = result.reason;
        setError(
          err instanceof PredictionError
            ? err.message
            : "The churn jammed. Couldn't reach the model.",
        );
        setPhase("jammed");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  // breaking -> settled, fixed duration (butter-breaks settle animation)
  useEffect(() => {
    if (phase !== "breaking") return;
    const t = setTimeout(() => setPhase("settled"), BREAK_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return { phase, data, error, submit, retry, reset };
}
