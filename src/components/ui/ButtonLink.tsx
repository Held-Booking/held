import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  paper: "bg-paper text-void hover:bg-white",
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
        "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium tracking-tight transition-colors duration-300",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
