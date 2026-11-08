// Browser-side helper: all calls go to this website's own /api/backend route,
// which adds the login token and forwards the request to the ASP.NET API.

export type BffResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

function messageFrom(json: unknown, status: number): string {
  if (typeof json === "string" && json) return json;

  if (json && typeof json === "object" && "message" in json) {
    const message = (json as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }

  if (status === 401) return "Please sign in to continue.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

export async function request<T>(url: string, method: string, body?: unknown): Promise<BffResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    let json: unknown = null;

    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
    }

    if (!response.ok) return { ok: false, status: response.status, message: messageFrom(json, response.status) };

    return { ok: true, data: json as T };
  } catch {
    return { ok: false, status: 0, message: "Could not reach the store. Check your connection and try again." };
  }
}

/** Call an API path through the proxy, e.g. bff("v1/cart"). */
export function bff<T>(path: string, method = "GET", body?: unknown) {
  return request<T>(`/api/backend/${path}`, method, body);
}

/** Login, register and logout. */
export function session<T>(action: "login" | "register" | "logout", body?: unknown) {
  return request<T>(`/api/session/${action}`, "POST", body ?? {});
}
