"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget ping to wake a sleeping free-tier backend the moment the
 * page loads, rather than waiting for the user's first prediction request
 * to trigger the cold start. By the time someone has set their four inputs
 * (tens of seconds) the backend is usually already warm, turning what
 * would be a 30-60s stall on "Churn It" into something they never notice.
 *
 * Errors are swallowed deliberately — this is best-effort warmth, not a
 * health check the UI needs to react to. usePrediction's own error
 * handling covers a backend that's still actually unreachable.
 */
export function useWarmBackend() {
  useEffect(() => {
    fetch("/api/health").catch(() => {});
  }, []);
}
