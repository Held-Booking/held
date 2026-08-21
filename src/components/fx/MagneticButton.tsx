"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [delta, setDelta] = useState({ x: 0, y: 0 });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setDelta({
          x: (e.clientX - r.left - r.width / 2) * 0.22,
          y: (e.clientY - r.top - r.height / 2) * 0.22,
        });
      }}
      onPointerLeave={() => setDelta({ x: 0, y: 0 })}
      className={cn(
        "relative min-h-12 w-full overflow-hidden rounded-full bg-paper px-7 text-sm font-medium text-void transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(243,244,246,0.22)] active:opacity-80 sm:w-auto",
        className,
      )}
      style={{
        transform: `translate(${delta.x}px, ${delta.y}px)`,
        transition: "transform 0.15s ease-out, box-shadow 0.3s",
      }}
    >
      {children}
    </button>
  );
}
