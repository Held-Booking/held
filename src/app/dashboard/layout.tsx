import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SetupNotice } from "@/components/dashboard/SetupNotice";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme-server";
import { NOINDEX } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isMissingSchema } from "@/lib/supabase/errors";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: NOINDEX };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    const lang = await getLang();
    const theme = await getTheme();
    const t = dict(lang);
    return (
      <Shell lang={lang} theme={theme} labels={t.dash}>
        <SetupNotice
          title="Keys missing"
          body="Held needs a .env.local file with your Supabase URL and anon key. The URL must start with https://"
        />
      </Shell>
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  if (isMissingSchema(error?.message)) {
    const lang = await getLang();
    const theme = await getTheme();
    const t = dict(lang);
    return (
      <Shell lang={lang} theme={theme} labels={t.dash}>
        <SetupNotice
          title="Tables missing"
          body="The SQL has to run inside your Supabase project. sqliteonline.com is a different database, so those tables never existed here."
        />
      </Shell>
    );
  }

  if (!profile?.slug) redirect("/onboarding");

  const lang = await getLang();
  const theme = await getTheme();
  const t = dict(lang);
  return (
    <Shell lang={lang} theme={theme} labels={t.dash}>
      {children}
    </Shell>
  );
}

function Shell({
  children,
  lang = "en",
  theme = "dark",
  labels,
}: {
  children: React.ReactNode;
  lang?: import("@/lib/i18n").Locale;
  theme?: import("@/lib/theme").Theme;
  labels?: {
    today: string;
    bookings: string;
    packages: string;
    hours: string;
    billing: string;
    settings: string;
    logout: string;
  };
}) {
  const nav = labels ?? {
    today: "Home",
    bookings: "Bookings",
    packages: "Packages",
    hours: "Hours",
    billing: "Billing",
    settings: "Settings",
    logout: "Log out",
  };
  return (
    <div className="flex min-h-dvh flex-1 flex-col overflow-x-clip bg-void lg:flex-row">
      <aside className="border-b border-line bg-void-2 px-3 py-3 text-center lg:w-56 lg:border-b-0 lg:border-r lg:px-5 lg:py-5 lg:text-start">
        <div className="flex items-center justify-between gap-2 lg:block">
          <Link href="/" className="font-display text-xl">
            {BRAND.name}
            <span className="text-signal">.</span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle current={theme} className="h-11 w-11 bg-void" />
            <LanguageSwitcher current={lang} />
            <SignOutButton label={nav.logout} compact />
          </div>
        </div>
        <DashboardNav labels={nav} />
        <div className="mt-3 hidden lg:block">
          <div className="flex items-center gap-2">
            <ThemeToggle current={theme} className="h-11 w-11 bg-void" />
            <LanguageSwitcher current={lang} />
          </div>
          <SignOutButton label={nav.logout} />
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-start [&_form]:text-start [&_label]:text-start">
          {children}
        </div>
      </div>
    </div>
  );
}
