import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE, backendRequest, clearAuthCookies, isSameOrigin } from "@/lib/session";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      // Tell the API to stop accepting this refresh token
      await backendRequest("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Even if the API is unreachable, the cookies below are removed
    }
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
