import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode } from "@/lib/seo";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  const trail = [{ name: "Held", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbNode(trail)} />
      <nav aria-label="Breadcrumb" className="text-sm text-dim">
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 lg:justify-start">
          {trail.map((item, i) => (
            <li key={item.path} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i === trail.length - 1 ? (
                <span className="text-paper">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-signal">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
