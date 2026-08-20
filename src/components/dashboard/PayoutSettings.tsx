"use client";

import { useEffect, useState, useTransition } from "react";
import { disconnectGoogle, resolveBank, saveBank, saveBio, saveDisplayName, savePhoto, savePayout, saveWhatsapp } from "@/app/dashboard/actions";
import { COUNTRIES, PAYSTACK_COUNTRIES } from "@/lib/gateways";
import { PasswordSettings } from "@/components/dashboard/PasswordSettings";
import type { Messages } from "@/lib/i18n";

type Bank = { name: string; code: string };

export function PayoutSettings({
  email,
  displayName,
  slug,
  country,
  currency,
  bio,
  whatsapp,
  bankCode,
  accountNumber,
  accountName,
  connected,
  photo,
  googleOn = false,
  googleReady = false,
  googleTitle = "Google Calendar",
  googleOnCopy = "New bookings land on your Google Calendar.",
  googleOffCopy = "Connect Google to put bookings on your calendar.",
  googleRedirectUri = "https://bookheld.app/api/google/callback",
  appUrl = "https://bookheld.app",
  connectGoogle = "Connect Google",
  passwordCopy,
}: {
  country: string;
  currency: string;
  bio: string;
  whatsapp: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  connected: boolean;
  photo: string;
  googleOn?: boolean;
  googleReady?: boolean;
  googleTitle?: string;
  googleOnCopy?: string;
  googleOffCopy?: string;
  googleRedirectUri?: string;
  appUrl?: string;
  connectGoogle?: string;
  passwordCopy?: Messages["auth"];
  email: string;
  displayName: string;
  slug: string;
}) {
  const paystackCountry = PAYSTACK_COUNTRIES.has(country.toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(paystackCountry);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState(accountName);
  const [googleHint, setGoogleHint] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("google");
    const reasonRaw = params.get("reason") ?? "";
    const reason = reasonRaw.toLowerCase();
    if (!err) return;
    if (err === "ok") {
      setGoogleHint("Google Calendar is connected. New bookings will land on it.");
      return;
    }
    if (err === "access_denied") {
      setGoogleHint(
        "Google blocked connect. Add this Gmail as a test user in Google Cloud, or try again if you tapped Cancel.",
      );
      return;
    }
    if (err === "redirect_uri_mismatch" || reason.includes("redirect_uri")) {
      setGoogleHint(
        `Google rejected the return address. In Google Cloud → Credentials → your Web client, Authorized redirect URI must be exactly: ${googleRedirectUri}`,
      );
      return;
    }
    if (err === "state") {
      setGoogleHint(
        "Connect was interrupted. Open Settings on https://www.bookheld.app and tap Connect Google again.",
      );
      return;
    }
    if (reason.includes("refresh token")) {
      setGoogleHint(
        "Google connected but did not keep access. Turn on the Google Calendar API, add your Gmail as a test user, remove Held from Google Account → Security → Third-party access, then connect again.",
      );
      return;
    }
    if (err === "token" && reasonRaw) {
      setGoogleHint(`Google could not finish connect: ${reasonRaw}`);
      return;
    }
    setGoogleHint(
      "Google could not finish connect. Try again from https://www.bookheld.app/dashboard/settings",
    );
  }, [googleRedirectUri]);

  useEffect(() => {
    if (!paystackCountry) return;
    let alive = true;
    setBanksLoading(true);
    setBanksError(null);
    fetch(`/api/banks?country=${encodeURIComponent(country)}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (res) => {
        const data = (await res.json()) as { banks?: Bank[]; error?: string };
        if (!alive) return;
        setBanks(data.banks ?? []);
        if (data.error && (data.banks ?? []).length === 0) {
          setBanksError(data.error);
        }
      })
      .catch(() => {
        if (alive) {
          setBanks([]);
          setBanksError("Could not load banks. Refresh and try again.");
        }
      })
      .finally(() => {
        if (alive) setBanksLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [country, paystackCountry]);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        settings
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Settings</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-dim lg:mx-0">
        Account, page, payout, and calendar. Clients never pick a gateway.
      </p>

      <form
        className="mt-8 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await saveDisplayName(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <h2 className="text-center text-xl font-semibold tracking-tight lg:text-start lg:text-2xl">
          Account
        </h2>
        <p className="text-sm text-dim">
          Login email cannot be changed here. The name is what clients see.
        </p>
        <label className="block text-sm text-dim">
          Email
          <input
            type="email"
            value={email}
            readOnly
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void-2 px-4 text-base text-paper"
          />
        </label>
        <label className="block text-sm text-dim">
          Page name
          <input
            name="displayName"
            defaultValue={displayName}
            required
            minLength={2}
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper"
          />
        </label>
        {slug ? (
          <p className="rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
            <span className="text-dim">Your link </span>
            <span className="text-signal">
              {`${appUrl.replace(/^https?:\/\//, "")}/book/${slug}`}
            </span>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save name"}
        </button>
      </form>

      <div className="mt-10 h-px w-full bg-line" />

      {passwordCopy ? (
        <>
          <div className="mt-8">
            <PasswordSettings copy={passwordCopy} />
          </div>
        </>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm">
          Settings saved.
        </p>
      ) : null}

      <form
        className="mt-8 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await savePayout(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <label className="block text-sm text-dim">
          Country
          <select
            name="country"
            defaultValue={country}
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void-2 px-3 text-base text-paper"
          >
            {COUNTRIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {item.currency}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-dim">
          Deposits are live in Nigeria, Ghana, Kenya, South Africa, and Côte d’Ivoire. More countries are opening. You can set your country now.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save country"}
        </button>
      </form>

      <div className="mt-10 h-px w-full bg-line" />

      <form
        className="mt-8 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await saveBio(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">Your page</h2>
        <p className="text-sm text-dim">
          A short intro clients read before they book. Leave it blank if the name is enough.
        </p>
        <label className="block text-sm text-dim">
          Intro
          <textarea
            name="bio"
            defaultValue={bio}
            maxLength={280}
            rows={3}
            placeholder="What you do, in one or two lines"
            className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3 text-base text-paper placeholder:text-dim/60"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save intro"}
        </button>
      </form>

      <div className="mt-10 h-px w-full bg-line" />

      <form
        className="mt-8 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await savePhoto(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">Photo</h2>
        <p className="text-sm text-dim">
          One face or mark on the booking page. JPG, PNG, or WebP. Under 1.5 MB.
        </p>
        {photo ? (
          <img src={photo} alt={displayName} className="mx-auto h-20 w-20 rounded-2xl object-cover lg:mx-0" />
        ) : null}
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block w-full max-w-full text-sm text-dim file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-4 file:py-2 file:text-sm file:text-void"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save photo"}
        </button>
      </form>

      <div className="mt-10 h-px w-full bg-line" />

      <form
        className="mt-8 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await saveWhatsapp(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">WhatsApp</h2>
        <p className="text-sm text-dim">
          Clients tap this after they pay. You get a chat link on each booking too.
        </p>
        <label className="block text-sm text-dim">
          Your WhatsApp
          <input
            name="whatsapp"
            defaultValue={whatsapp}
            inputMode="tel"
            autoComplete="tel"
            placeholder="08012345678"
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save WhatsApp"}
        </button>
      </form>

      <div className="mt-10 h-px w-full bg-line" />

      {paystackCountry ? (
        <form
          className="mt-8 space-y-4"
          action={(formData) => {
            setError(null);
            setSaved(false);
            startTransition(async () => {
              const result = await saveBank(formData);
              if (result?.error) setError(result.error);
              else {
                setSaved(true);
                if (result.name) setVerifiedName(result.name);
              }
            });
          }}
        >
          <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">Payout bank</h2>
          <p className="text-sm text-dim">
            {connected
              ? `Deposits go to ${accountName || "this account"}. Held takes none of the job.`
              : "Add your bank. Deposits then land with you, not with Held."}
          </p>
          {verifiedName ? (
            <p className="rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm">
              {verifiedName}
            </p>
          ) : null}
          <label className="block text-sm text-dim">
            Bank
            <select
              name="bankCode"
              defaultValue={bankCode}
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void-2 px-3 text-base text-paper"
            >
              <option value="">Pick a bank</option>
              {banks.map((bank) => (
                <option key={`${bank.code}-${bank.name}`} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </label>
          {banksLoading ? (
            <p className="text-sm text-dim">Loading banks...</p>
          ) : banks.length === 0 ? (
            <p className="text-sm text-dim">
              {banksError ??
                "No banks loaded. Refresh this page. If it stays empty, the Paystack key on the server is missing or invalid."}
            </p>
          ) : null}
          <label className="block text-sm text-dim">
            Account number
            <input
              name="accountNumber"
              defaultValue={accountNumber}
              inputMode="numeric"
              autoComplete="off"
              required
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
              placeholder="0123456789"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={pending}
              className="min-h-12 flex-1 rounded-full border border-line text-sm disabled:opacity-40"
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (!form) return;
                const formData = new FormData(form);
                setError(null);
                startTransition(async () => {
                  const result = await resolveBank(formData);
                  if (result?.error) {
                    setVerifiedName("");
                    setError(result.error);
                  } else {
                    setVerifiedName(result.name ?? "");
                  }
                });
              }}
            >
              {pending ? "Checking..." : "Verify name"}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 flex-1 rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
            >
              {pending ? "Saving..." : "Save bank"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8">
          <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">Payout bank</h2>
          <p className="mt-3 text-sm text-dim">
            Bank payouts for this country are next. You can finish the rest of your page now.
          </p>
        </div>
      )}

      <div className="mt-10 h-px w-full bg-line" />
      <div className="mt-8">
        <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">{googleTitle}</h2>
        <p className="mt-3 text-sm text-dim">
          {googleOn ? googleOnCopy : googleOffCopy}
        </p>
        {googleHint ? (
          <p className="mt-3 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
            {googleHint}
          </p>
        ) : null}
        {googleReady ? (
          googleOn ? (
            <form
              className="mt-4"
              action={() => {
                setError(null);
                startTransition(async () => {
                  const result = await disconnectGoogle();
                  if (result?.error) setError(result.error);
                  else setSaved(true);
                });
              }}
            >
              <button
                type="submit"
                disabled={pending}
                className="min-h-12 w-full rounded-full border border-line px-5 text-sm disabled:opacity-40 sm:w-auto"
              >
                Disconnect
              </button>
            </form>
          ) : (
            <a
              href="/api/google/start"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-paper px-5 text-sm font-medium text-void sm:w-auto"
            >
              {connectGoogle}
            </a>
          )
        ) : (
          <p className="mt-3 text-sm text-dim">Calendar connect is not on yet.</p>
        )}
      </div>
    </div>
  );
}
