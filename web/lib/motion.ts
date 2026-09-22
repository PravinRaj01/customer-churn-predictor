/**
 * Global spring vocabulary. Every animated thing in the app draws from
 * this set — that repetition is what makes the motion read as one system
 * instead of a pile of one-off tweens. See
 * docs/BUTTER_CHURN_BLUEPRINT.md §2 for the rationale behind each preset.
 */
export const spring = {
  /** Default — segmented pills, general UI settle. */
  butter: { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as const,
  /** Snappy — press feedback, steppers. */
  pat: { type: "spring", stiffness: 420, damping: 30, mass: 0.6 } as const,
  /** Heavy, viscous — cream pouring/rising, droplets. */
  pour: { type: "spring", stiffness: 120, damping: 20, mass: 1.4 } as const,
};

/** The house easing curve (easeOutQuint). Used for every non-continuous,
 * non-spring transition — card reveals, arc sweeps, color fades. */
export const ease = {
  churn: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
