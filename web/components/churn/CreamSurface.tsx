/**
 * Builds the `d` attribute for one cream-surface wave path, closed against
 * the barrel's base so it fills solidly beneath the waterline.
 *
 * This is a plain function rather than a component because ChurnBarrel
 * mutates the path's `d` attribute directly on every animation frame via
 * a ref (see ChurnBarrel.tsx) — going through React state at 60fps would
 * mean 60 re-renders/sec for a value React never needs to read back.
 */
export function buildCreamPath(
  baseY: number,
  amplitude: number,
  t: number,
  phase: number,
  floorY: number,
): string {
  const points = Array.from({ length: 7 }, (_, i) => {
    const x = 30 + i * 20;
    const y = baseY + Math.sin(t * 2 + i * 0.9 + phase) * amplitude;
    return `${i === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
  });
  return `${points.join(" ")} L150 ${floorY} L30 ${floorY} Z`;
}
