import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";

// Product images live on the API server. They are served through this website so the browser
// only ever talks to one address (no certificate or mixed-content problems).
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  // Only plain file names inside uploads/products are allowed
  if (path.length !== 2 || path[0] !== "products" || !/^[A-Za-z0-9._-]+$/.test(path[1])) {
    return new NextResponse("Not found", { status: 404 });
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${API_BASE_URL}/uploads/products/${path[1]}`, { cache: "no-store" });
  } catch {
    return new NextResponse("Image server unavailable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // File names contain a random id and never change, so browsers may keep them for a long time
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
