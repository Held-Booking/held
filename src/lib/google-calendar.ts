import { isGoogleConfigured } from "@/lib/supabase/config";
import { publicAppUrl } from "@/lib/origin";

const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const CAL = "https://www.googleapis.com/calendar/v3";

function googleClientId() {
  return (process.env.GOOGLE_CLIENT_ID ?? "").trim().replace(/^["']|["']$/g, "");
}

function googleClientSecret() {
  return (process.env.GOOGLE_CLIENT_SECRET ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function googleRedirectUri(origin?: string) {
  return `${(origin || publicAppUrl()).replace(/\/$/, "")}/api/google/callback`;
}

export function googleConnectUrl(state?: string, origin?: string) {
  if (!isGoogleConfigured()) return null;
  const params = new URLSearchParams({
    client_id: googleClientId(),
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  if (state) params.set("state", state);
  return `${AUTH}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, origin?: string) {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const json = (await res.json()) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.refresh_token) {
    throw new Error(
      json.error_description ?? json.error ?? "Google did not return a refresh token.",
    );
  }
  return json.refresh_token;
}

async function accessToken(refreshToken: string) {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? "Google access token failed.",
    );
  }
  return json.access_token;
}

function googleErrorMessage(json: unknown, status: number) {
  const err = (json as { error?: { message?: string } | string }).error;
  if (typeof err === "string" && err) return err;
  if (err && typeof err === "object" && err.message) return err.message;
  return `Google Calendar ${status}`;
}

export async function upsertGoogleEvent(input: {
  refreshToken: string;
  calendarId?: string | null;
  eventId?: string | null;
  title: string;
  start: string;
  end: string;
  timeZone?: string | null;
  description?: string;
}) {
  if (!isGoogleConfigured()) return null;
  const token = await accessToken(input.refreshToken);
  const calendarId = encodeURIComponent(input.calendarId || "primary");
  const timeZone = input.timeZone || "UTC";
  const body = {
    summary: input.title,
    description: input.description ?? "",
    start: { dateTime: input.start, timeZone },
    end: { dateTime: input.end, timeZone },
  };
  const url = input.eventId
    ? `${CAL}/calendars/${calendarId}/events/${encodeURIComponent(input.eventId)}`
    : `${CAL}/calendars/${calendarId}/events`;
  const res = await fetch(url, {
    method: input.eventId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { id?: string };
  if (!res.ok) {
    if (input.eventId && (res.status === 404 || res.status === 410)) {
      return upsertGoogleEvent({ ...input, eventId: null });
    }
    throw new Error(googleErrorMessage(json, res.status));
  }
  return json.id ?? input.eventId ?? null;
}

export async function deleteGoogleEvent(input: {
  refreshToken: string;
  calendarId?: string | null;
  eventId: string;
}) {
  if (!isGoogleConfigured()) return;
  const token = await accessToken(input.refreshToken);
  const calendarId = encodeURIComponent(input.calendarId || "primary");
  const res = await fetch(
    `${CAL}/calendars/${calendarId}/events/${encodeURIComponent(input.eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google Calendar delete ${res.status}`);
  }
}
