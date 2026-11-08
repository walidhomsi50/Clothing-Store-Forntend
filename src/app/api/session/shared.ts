import { NextRequest, NextResponse } from "next/server";
import {
  GUEST_COOKIE,
  backendRequest,
  errorMessage,
  isUuid,
  setAuthCookies,
  type AuthResponse,
} from "@/lib/session";

export async function readJson<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function unavailable() {
  return NextResponse.json(
    { message: "The store is temporarily unavailable. Please try again in a moment." },
    { status: 502 },
  );
}

/** Shared by login and register: stores the tokens in cookies and merges the guest cart. */
export async function completeLogin(upstream: Response, request: NextRequest, fallbackError: string) {
  const text = await upstream.text();

  if (!upstream.ok) {
    return NextResponse.json({ message: errorMessage(text, fallbackError) }, { status: upstream.status });
  }

  const auth = JSON.parse(text) as AuthResponse;

  // Items the visitor added before logging in move into their account cart
  const guestToken = request.cookies.get(GUEST_COOKIE)?.value;

  if (isUuid(guestToken)) {
    try {
      await backendRequest("/api/v1/cart/merge", {
        method: "POST",
        accessToken: auth.accessToken,
        guestToken,
      });
    } catch {
      // The login still succeeds without the merge
    }
  }

  const response = NextResponse.json({ user: { displayName: auth.displayName, email: auth.email } });
  setAuthCookies(response, auth);
  return response;
}
