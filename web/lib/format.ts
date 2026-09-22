export function formatTenure(months: number): string {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${months} mo`;
  if (remainder === 0) return `${years} yr`;
  return `${years} yr ${remainder} mo`;
}

export function formatCurrency(value: number): string {
  return value.toFixed(2);
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
