export const WEEK_SIDE = "#7a808a";
export const WEEK_CENTER = "#7eb4ff";

export const WEEK_DOTS = [
  { x: 0.18, r: 0.048, delay: 1.22, center: false },
  { x: 0.3, r: 0.048, delay: 0.82, center: false },
  { x: 0.42, r: 0.048, delay: 0.42, center: false },
  { x: 0.5, r: 0.096, delay: 0, center: true },
  { x: 0.58, r: 0.048, delay: 0.42, center: false },
  { x: 0.7, r: 0.048, delay: 0.82, center: false },
  { x: 0.82, r: 0.048, delay: 1.22, center: false },
] as const;

export function weekProgress(elapsed: number, delay: number, duration: number) {
  const t = (elapsed - delay) / duration;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}
