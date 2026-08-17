"use client";

import { useEffect, useState } from "react";

export function Atmosphere() {
  const [pos, setPos] = useState({ x: 50, y: 28 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(720px circle at ${pos.x}% ${pos.y}%, rgba(126,180,255,0.1), transparent 42%)`,
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-[-20%] z-0 hidden h-[48vh] overflow-hidden opacity-55 [mask-image:linear-gradient(to_bottom,transparent,black_28%,transparent)] md:block">
        <div className="horizon h-[140%] w-full [transform:perspective(500px)_rotateX(62deg)]" />
      </div>
      <div className="grain" />
    </>
  );
}
