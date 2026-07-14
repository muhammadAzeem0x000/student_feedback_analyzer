export function calculateResponsePercentage(total: number, expected: number | null | undefined) {
  if (!expected || expected <= 0) return null;
  return Math.round((total / expected) * 1000) / 10;
}
