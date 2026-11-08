import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  GUEST_COOKIE,
  REFRESH_COOKIE,
  backendRequest,
  clearAuthCookies,
  isSameOrigin,
  isUuid,
  refreshLogin,
  setAuthCookies,
  setGuestCookie,
  type AuthResponse,
} from "@/lib/session";

// The browser only talks to this website. This route forwards its requests to the ASP.NET API,
// adding the login token (kept in an httpOnly cookie) and the guest cart token.
// Only the paths below can be reached: admin endpoints are deliberately NOT listed.
const ALLOWED_PATHS = [
  /^v1\/cart(\/\d+|\/items(\/\d+)?|\/merge)?$/,
  /^v1\/orders(\/\d+(\/cancel)?|\/guest|\/track\/[0-9a-fA-F-]{36})?$/,
  /^v1\/checkout\/payment-methods$/,
  /^v1\/auth\/me$/,
  /^customer-addresses(\/\d+)?$/,
  /^customers\/me$/,
  /^customers\/change-password$/,
];

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const joined = path.join("/");

  if (!ALLOWED_PATHS.some((pattern) => pattern.test(joined))) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  if (request.method !== "GET" && !isSameOrigin(request)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let guestToken = request.cookies.get(GUEST_COOKIE)?.value;
  let isNewGuest = false;

  if (!isUuid(guestToken)) {
    guestToken = crypto.randomUUID();
    isNewGuest = true;
  }

  let refreshed: AuthResponse | null = null;
  let loginExpired = false;

  // The access cookie lasts about 15 minutes; renew it from the refresh cookie when it is gone
  if (!accessToken && refreshToken) {
    refreshed = await refreshLogin(refreshToken);

    if (refreshed) accessToken = refreshed.accessToken;
    else loginExpired = true;
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;
  const target = `/api/${joined}${request.nextUrl.search}`;
  const method = request.method;

  let upstream: Response;

  try {
    upstream = await backendRequest(target, { method, body, accessToken, guestToken });

    // The access token may have expired a moment ago: renew it once and retry
    if (upstream.status === 401 && refreshToken && !refreshed && accessToken) {
      refreshed = await refreshLogin(refreshToken);

      if (refreshed) {
        upstream = await backendRequest(target, {
          method,
          body,
          accessToken: refreshed.accessToken,
          guestToken,
        });
      } else {
        loginExpired = true;
      }
    }
  } catch {
    return NextResponse.json(
      { message: "The store is temporarily unavailable. Please try again in a moment." },
      { status: 502 },
    );
  }

  const text = await upstream.text();

  const response = new NextResponse(text.length > 0 ? text : null, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });

  if (refreshed) setAuthCookies(response, refreshed);
  else if (loginExpired) clearAuthCookies(response);

  if (isNewGuest) setGuestCookie(response, guestToken);

  return response;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
