import { RiskBand } from "@/lib/types";

const HIGH_RISK_ACTIONS = [
  "Offer a retention discount",
  "Flag for outreach within 48 hours",
  "Propose a one-year contract",
];

const LOW_RISK_ACTIONS = [
  "No action needed — check back next cycle",
  "Candidate for a loyalty upsell",
];

const ACTIONS: Record<RiskBand, string[]> = {
  spoiled: HIGH_RISK_ACTIONS,
  curdling: HIGH_RISK_ACTIONS,
  steady: LOW_RISK_ACTIONS,
  creamy: LOW_RISK_ACTIONS,
};

export function Recommendations({ band }: { band: RiskBand }) {
  return (
    <ul className="mt-4 space-y-2">
      {ACTIONS[band].map((action) => (
        <li
          key={action}
          className="flex items-start gap-2 text-sm text-ink-700"
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-500" />
          {action}
        </li>
      ))}
    </ul>
  );
}
