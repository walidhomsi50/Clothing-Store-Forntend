import { NextRequest, NextResponse } from "next/server";
import { backendRequest, isSameOrigin } from "@/lib/session";
import { completeLogin, readJson, unavailable } from "../shared";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const payload = await readJson<{ email?: string; password?: string }>(request);
  if (!payload) return NextResponse.json({ message: "Invalid request." }, { status: 400 });

  try {
    const upstream = await backendRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: payload.email ?? "", password: payload.password ?? "" }),
    });

    return await completeLogin(upstream, request, "Invalid email or password.");
  } catch {
    return unavailable();
  }
}
