import { z } from "zod";

/**
 * Mirrors api/schemas.py exactly. Keep these in sync by hand — there are
 * only two schemas, so a codegen step would be more ceremony than value.
 */

export const CONTRACT_OPTIONS = [
  "Month-to-month",
  "One year",
  "Two year",
] as const;

export const INTERNET_OPTIONS = ["DSL", "Fiber optic", "No"] as const;

export const PredictRequestSchema = z.object({
  tenure: z.number().int().min(0).max(72),
  monthly_charges: z.number().min(0).max(150),
  contract: z.enum(CONTRACT_OPTIONS),
  internet_service: z.enum(INTERNET_OPTIONS),
});
export type PredictRequest = z.infer<typeof PredictRequestSchema>;

export const RiskBandSchema = z.enum([
  "creamy",
  "steady",
  "curdling",
  "spoiled",
]);
export type RiskBand = z.infer<typeof RiskBandSchema>;

export const PredictResponseSchema = z.object({
  prediction: z.number().int(),
  churn_probability: z.number(),
  retention_probability: z.number(),
  risk_band: RiskBandSchema,
  threshold: z.number(),
  model: z.object({
    type: z.string(),
    sklearn: z.string(),
  }),
});
export type PredictResponse = z.infer<typeof PredictResponseSchema>;

/**
 * The churn animation phase machine (see docs/BUTTER_CHURN_BLUEPRINT.md
 * §3.3). ChurnBarrel is a pure function of this value; usePrediction is
 * its only source of truth so the button, barrel and result card can
 * never disagree about what's happening.
 *
 *   idle --submit--> pouring --> churning --resolve--> breaking --> settled
 *                                    |
 *                                    +--reject--> jammed --retry--> pouring
 */
export type ChurnPhase =
  | "idle"
  | "pouring"
  | "churning"
  | "breaking"
  | "settled"
  | "jammed";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  model_loaded: z.boolean(),
  columns: z.array(z.string()),
  sklearn_version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
