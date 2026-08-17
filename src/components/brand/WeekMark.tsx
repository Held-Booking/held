"use client";

import { useEffect } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const CY = 7;
const CENTER = 26;
const REPLAY_MS = 30_000;
const R_SIDE = 1.52;
const R_CENTER = 3.08;

type Dot = {
  spreadX: number;
  openX: number;
  r: number;
  delay: number;
  center: boolean;
};

function row(scale: number) {
  const inner = 5.7 * scale;
  const step = 4.18 * scale;
  return [
    CENTER - inner - step * 2,
    CENTER - inner - step,
    CENTER - inner,
    CENTER,
    CENTER + inner,
    CENTER + inner + step,
    CENTER + inner + step * 2,
  ];
}

const SPREAD_X = row(1);
const OPEN_X = row(1.12);
const DELAYS = [1.22, 0.82, 0.42, 0, 0.42, 0.82, 1.22] as const;

const DOTS: Dot[] = SPREAD_X.map((spreadX, i) => ({
  spreadX,
  openX: OPEN_X[i],
  r: i === 3 ? R_CENTER : R_SIDE,
  delay: DELAYS[i],
  center: i === 3,
}));

const variants = {
  gather: (dot: Dot) =>
    dot.center
      ? {
          cx: CENTER,
          r: dot.r,
          opacity: 1,
          transition: { duration: 0 },
        }
      : {
          cx: CENTER,
          r: 0.22,
          opacity: 0,
          transition: {
            duration: 0.85,
            delay: 1.22 - dot.delay,
            ease: EASE,
          },
        },
  spread: (dot: Dot) => ({
    cx: dot.spreadX,
    r: dot.r,
    opacity: 1,
    transition: {
      duration: dot.center ? 0.72 : 1.15,
      delay: dot.delay,
      ease: EASE,
    },
  }),
  open: (dot: Dot) => ({
    cx: dot.openX,
    r: dot.r,
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: dot.center ? 0 : 0.08,
      ease: EASE,
    },
  }),
};

async function playSpread(controls: ReturnType<typeof useAnimationControls>) {
  await controls.start("spread");
  await controls.start("open");
}

export function WeekMark({ className }: { className?: string }) {
  const reduce = useReducedMotion() === true;
  const controls = useAnimationControls();

  useEffect(() => {
    if (reduce) return;

    void playSpread(controls);

    const id = window.setInterval(() => {
      if (document.hidden) return;
      void (async () => {
        await controls.start("gather");
        await playSpread(controls);
      })();
    }, REPLAY_MS);

    return () => {
      window.clearInterval(id);
      controls.stop();
    };
  }, [reduce, controls]);

  return (
    <svg
      viewBox="0 0 52 14"
      className={cn(
        "week-mark pointer-events-none h-[22px] w-[5.3rem] shrink-0 overflow-visible sm:h-[26px] sm:w-[6.6rem] md:h-7 md:w-[7.7rem]",
        className,
      )}
      aria-hidden
      focusable="false"
    >
      {DOTS.map((dot) =>
        reduce ? (
          <circle
            key={dot.spreadX}
            cx={dot.openX}
            cy={CY}
            r={dot.r}
            fill={dot.center ? "#7eb4ff" : "#7a808a"}
          />
        ) : (
          <motion.circle
            key={dot.spreadX}
            custom={dot}
            variants={variants}
            initial={{
              cx: CENTER,
              r: dot.center ? 0.7 : 0.22,
              opacity: 0,
            }}
            animate={controls}
            cy={CY}
            fill={dot.center ? "#7eb4ff" : "#7a808a"}
          />
        ),
      )}
    </svg>
  );
}
