import { NextRequest, NextResponse } from "next/server";
import { backendRequest, isSameOrigin } from "@/lib/session";
import { completeLogin, readJson, unavailable } from "../shared";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  const payload = await readJson<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>(request);

  if (!payload) return NextResponse.json({ message: "Invalid request." }, { status: 400 });

  try {
    const upstream = await backendRequest("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: payload.firstName ?? "",
        lastName: payload.lastName ?? "",
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        password: payload.password ?? "",
      }),
    });

    return await completeLogin(upstream, request, "Registration failed. Please check your details.");
  } catch {
    return unavailable();
  }
}
