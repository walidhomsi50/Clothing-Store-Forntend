import { cache } from "react";
import { API_BASE_URL } from "./config";
import type {
  Category,
  Filters,
  OrderDetails,
  Paged,
  PaymentMethod,
  ProductDetails,
  ProductListItem,
} from "./types";

/** Thrown when the API cannot be reached or answers with a server error. */
export class BackendUnavailableError extends Error {
  constructor(message = "The store is temporarily unavailable.") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

/** GET from the API (server side). Returns null when the API answers 404. */
async function apiGet<T>(path: string): Promise<T | null> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new BackendUnavailableError();
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new BackendUnavailableError(`The store API answered with status ${response.status}.`);

  return (await response.json()) as T;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, value);
  }

  const text = search.toString();
  return text ? `?${text}` : "";
}

// cache() lets the header, the page and generateMetadata share one request for the same data
export const getCategories = cache(async (): Promise<Category[]> => {
  return (await apiGet<Category[]>("/api/v1/categories")) ?? [];
});

export async function getFilters(categorySlug?: string): Promise<Filters | null> {
  return apiGet<Filters>(`/api/v1/catalog/filters${query({ categorySlug })}`);
}

export async function getProducts(params: Record<string, string | undefined>): Promise<Paged<ProductListItem> | null> {
  return apiGet<Paged<ProductListItem>>(`/api/v1/products${query(params)}`);
}

// cache() makes the page and generateMetadata share one request for the same product
export const getProduct = cache(async (slug: string): Promise<ProductDetails | null> => {
  return apiGet<ProductDetails>(`/api/v1/products/${encodeURIComponent(slug)}`);
});

export async function getRelated(slug: string): Promise<ProductListItem[]> {
  return (await apiGet<ProductListItem[]>(`/api/v1/products/${encodeURIComponent(slug)}/related`)) ?? [];
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return (await apiGet<PaymentMethod[]>("/api/v1/checkout/payment-methods")) ?? [];
}

export async function getTrackedOrder(token: string): Promise<OrderDetails | null> {
  return apiGet<OrderDetails>(`/api/v1/orders/track/${encodeURIComponent(token)}`);
}
