"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function query(params: URLSearchParams, hash: URLSearchParams, key: string) {
  return params.get(key) ?? hash.get(key);
}

function resetPending() {
  try {
    return document.cookie.includes("held_password_reset=1");
  } catch {
    return false;
  }
}

export function AuthLinkCatch() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const url = new URL(window.location.href);
    if (url.pathname === "/auth/callback" || url.pathname === "/auth/reset") {
      return;
    }

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const code = query(url.searchParams, hash, "code");
    const tokenHash = query(url.searchParams, hash, "token_hash");
    const type = query(url.searchParams, hash, "type");
    const access = hash.get("access_token");
    const refresh = hash.get("refresh_token");
    const recovery =
      type === "recovery" || hash.get("type") === "recovery" || resetPending();

    if (code) {
      const dest = new URL(recovery ? "/auth/reset" : "/auth/callback", url.origin);
      dest.searchParams.set("code", code);
      if (type) dest.searchParams.set("type", type);
      window.location.replace(dest.toString());
      return;
    }

    if (tokenHash && type) {
      const dest = new URL(recovery ? "/auth/reset" : "/auth/callback", url.origin);
      dest.searchParams.set("token_hash", tokenHash);
      dest.searchParams.set("type", type);
      window.location.replace(dest.toString());
      return;
    }

    if (access && refresh) {
      const supabase = createBrowserSupabase();
      void supabase.auth
        .setSession({ access_token: access, refresh_token: refresh })
        .then(({ error }) => {
          window.location.replace(
            error
              ? "/forgot-password"
              : recovery
                ? "/auth/update-password"
                : "/dashboard",
          );
        });
    }
  }, []);

  return null;
}
