export const WEEK_SIDE = "#7a808a";
export const WEEK_CENTER = "#7eb4ff";

export const WEEK_DOTS = [
  { x: 0.08, r: 0.09, delay: 1.22, center: false },
  { x: 0.22, r: 0.09, delay: 0.82, center: false },
  { x: 0.36, r: 0.09, delay: 0.42, center: false },
  { x: 0.5, r: 0.17, delay: 0, center: true },
  { x: 0.64, r: 0.09, delay: 0.42, center: false },
  { x: 0.78, r: 0.09, delay: 0.82, center: false },
  { x: 0.92, r: 0.09, delay: 1.22, center: false },
] as const;

export function weekProgress(elapsed: number, delay: number, duration: number) {
  const t = (elapsed - delay) / duration;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3);
}
