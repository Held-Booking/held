"use client";

import { useEffect } from "react";
import { WEEK_CENTER, WEEK_DOTS, WEEK_SIDE, weekProgress } from "@/lib/week-mark";

const SIZE = 64;
const CY = SIZE / 2;
const CENTER = SIZE / 2;
const SPREAD_MS = 2300;
const OPEN_MS = 700;

function hex(color: string): [number, number, number] {
  const n = Number.parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  r: number,
  color: string,
  alpha: number,
) {
  ctx.beginPath();
  ctx.arc(x, CY, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${hex(color).join(",")},${alpha})`;
  ctx.fill();
}

export function FaviconSpread() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      document.head.appendChild(link);
    }
    const original = link.href;
    let frame = 0;
    let start = 0;

    function paint(elapsed: number) {
      if (!ctx || !link) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (const dot of WEEK_DOTS) {
        const spread = weekProgress(elapsed, dot.delay * 1000, 1150);
        const open = weekProgress(elapsed - SPREAD_MS, 80, OPEN_MS);
        const from = CENTER;
        const spreadX = dot.x * SIZE;
        const openX = CENTER + (spreadX - CENTER) * 1.08;
        const x = from + (spreadX - from) * spread + (openX - spreadX) * open;
        const targetR = dot.r * SIZE;
        const r = targetR * (0.18 + 0.82 * Math.max(spread, dot.center ? 0.35 : 0));
        const alpha = dot.center ? 1 : Math.min(1, spread);
        drawDot(ctx, x, r, dot.center ? WEEK_CENTER : WEEK_SIDE, alpha);
      }
      link.href = canvas.toDataURL("image/png");
    }

    if (reduce) {
      paint(SPREAD_MS + OPEN_MS);
      return;
    }

    function tick(now: number) {
      if (!start) start = now;
      const elapsed = now - start;
      paint(elapsed);
      if (elapsed < SPREAD_MS + OPEN_MS) {
        frame = window.requestAnimationFrame(tick);
      } else {
        paint(SPREAD_MS + OPEN_MS);
        window.setTimeout(() => {
          if (link) link.href = original;
        }, 80);
      }
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
