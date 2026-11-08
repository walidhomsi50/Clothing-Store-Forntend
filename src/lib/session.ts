import type { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "./config";

// Login tokens live in httpOnly cookies, so JavaScript in the browser can never read them.
export const ACCESS_COOKIE = "sf_access";
export const REFRESH_COOKIE = "sf_refresh";
export const GUEST_COOKIE = "sf_guest";

const isProduction = process.env.NODE_ENV === "production";

export type AuthResponse = {
  userId: number;
  displayName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(response: NextResponse, auth: AuthResponse) {
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, {
    ...baseCookie,
    maxAge: Math.max(60, auth.expiresInSeconds - 30),
  });
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

export function setGuestCookie(response: NextResponse, token: string) {
  response.cookies.set(GUEST_COOKIE, token, { ...baseCookie, maxAge: 60 * 60 * 24 * 365 });
}

export function isUuid(value: string | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Blocks cross-site form posts: the Origin header, when present, must match this site. */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type BackendOptions = {
  method?: string;
  body?: string;
  accessToken?: string;
  guestToken?: string;
};

export function backendRequest(path: string, options: BackendOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.guestToken) headers["X-Guest-Token"] = options.guestToken;

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    cache: "no-store",
  });
}

// ---------------------------------------------------------------------------
// Refreshing the login. The API rotates refresh tokens: using one twice is treated as theft
// and logs the user out everywhere. A page load fires several requests at once, so the first
// refresh is shared with the others instead of each one trying its own.
// ---------------------------------------------------------------------------
const inFlightRefreshes = new Map<string, Promise<AuthResponse | null>>();

export function refreshLogin(refreshToken: string): Promise<AuthResponse | null> {
  const existing = inFlightRefreshes.get(refreshToken);
  if (existing) return existing;

  const attempt = (async () => {
    try {
      const response = await backendRequest("/api/v1/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;
      return (await response.json()) as AuthResponse;
    } catch {
      return null;
    }
  })();

  inFlightRefreshes.set(refreshToken, attempt);
  // Keep the result for a few seconds so requests that were sent with the old cookie still reuse it
  setTimeout(() => inFlightRefreshes.delete(refreshToken), 20_000);

  return attempt;
}

/** Turns whatever the API sent as an error into a plain message string. */
export function errorMessage(text: string, fallback: string): string {
  if (!text) return fallback;

  try {
    const parsed: unknown = JSON.parse(text);

    if (typeof parsed === "string") return parsed;

    if (parsed && typeof parsed === "object" && "message" in parsed) {
      const message = (parsed as { message: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  } catch {
    // not JSON
  }

  return fallback;
}
