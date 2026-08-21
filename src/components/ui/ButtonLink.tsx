import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  paper: "bg-paper text-void hover:opacity-90",
  ghost:
    "border border-line text-paper hover:border-signal hover:text-signal",
  signal: "bg-signal text-void hover:brightness-110",
} as const;

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "paper",
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium tracking-tight transition-[color,background-color,border-color,opacity,transform,filter] duration-150 active:scale-[0.98] active:opacity-80",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
