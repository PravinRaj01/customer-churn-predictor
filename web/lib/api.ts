import {
  PredictRequest,
  PredictRequestSchema,
  PredictResponse,
  PredictResponseSchema,
} from "./types";

export class PredictionError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "PredictionError";
  }
}

/**
 * Calls the Next.js proxy route (app/api/predict/route.ts), which forwards
 * to the FastAPI backend. The browser never talks to the API server
 * directly, so no CORS configuration is needed in production.
 */
export async function predictChurn(
  input: PredictRequest,
): Promise<PredictResponse> {
  const payload = PredictRequestSchema.parse(input);

  let res: Response;
  try {
    res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PredictionError("Couldn't reach the churn API.");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // body wasn't JSON — keep the status text
    }
    throw new PredictionError(detail, res.status);
  }

  const json = await res.json();
  return PredictResponseSchema.parse(json);
}
