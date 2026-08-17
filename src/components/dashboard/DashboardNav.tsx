"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardNav({
  labels,
}: {
  labels: {
    today: string;
    bookings: string;
    packages: string;
    hours: string;
    billing: string;
    settings: string;
  };
}) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: labels.today },
    { href: "/dashboard/bookings", label: labels.bookings },
    { href: "/dashboard/services", label: labels.packages },
    { href: "/dashboard/availability", label: labels.hours },
    { href: "/dashboard/billing", label: labels.billing },
    { href: "/dashboard/settings", label: labels.settings },
  ];

  return (
    <nav className="mt-3 flex flex-wrap justify-center gap-1 lg:mt-8 lg:flex-col lg:flex-nowrap lg:items-start">
      {links.map((link) => {
        const on =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-2 text-xs lg:px-3 lg:py-2.5 lg:text-sm",
              on ? "bg-void text-signal" : "text-dim hover:bg-void hover:text-signal",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
