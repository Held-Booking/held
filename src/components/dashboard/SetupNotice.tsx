import Link from "next/link";

function sqlEditorUrl() {
  const host = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = host.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
  return ref
    ? `https://supabase.com/dashboard/project/${ref}/sql/new`
    : "https://supabase.com/dashboard";
}

export function SetupNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        setup
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-dim lg:mx-0">{body}</p>
      <ol className="mx-auto mt-8 max-w-md space-y-3 text-sm text-dim lg:mx-0">
        <li>1. Open your project at supabase.com</li>
        <li>2. Left sidebar: SQL Editor, then New query</li>
        <li>3. Paste supabase/migrations/001_init.sql and click Run</li>
        <li>4. Come back, log in, and add packages again</li>
      </ol>
      <Link
        href={sqlEditorUrl()}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-paper px-5 text-sm font-medium text-void sm:w-auto"
      >
        Open SQL Editor
      </Link>
    </div>
  );
}
