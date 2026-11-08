"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Filters } from "@/lib/types";

export type CurrentFilters = {
  sizes: number[];
  colors: number[];
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  inStock: boolean;
  sort: string;
  search: string;
};

type Props = {
  basePath: string;
  filters: Filters | null;
  current: CurrentFilters;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name A-Z" },
];

function toggle(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function FiltersPanel({ basePath, filters, current }: Props) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(current.minPrice);
  const [maxPrice, setMaxPrice] = useState(current.maxPrice);

  function go(next: Partial<CurrentFilters>) {
    const merged = { ...current, minPrice, maxPrice, ...next };
    const params = new URLSearchParams();

    if (merged.search) params.set("search", merged.search);
    if (merged.sizes.length) params.set("sizes", merged.sizes.join(","));
    if (merged.colors.length) params.set("colors", merged.colors.join(","));
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.onSale) params.set("onSale", "true");
    if (merged.inStock) params.set("inStock", "true");
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);

    const text = params.toString();
    router.push(text ? `${basePath}?${text}` : basePath);
  }

  const hasFilters =
    current.sizes.length > 0 ||
    current.colors.length > 0 ||
    current.minPrice !== "" ||
    current.maxPrice !== "" ||
    current.onSale ||
    current.inStock;

  return (
    <aside className="space-y-6 text-sm" aria-label="Filters">
      <div>
        <label htmlFor="sort" className="mb-1 block font-semibold">
          Sort by
        </label>
        <select
          id="sort"
          value={current.sort}
          onChange={(event) => go({ sort: event.target.value })}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={current.onSale} onChange={(event) => go({ onSale: event.target.checked })} />
          On sale
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={current.inStock} onChange={(event) => go({ inStock: event.target.checked })} />
          In stock only
        </label>
      </div>

      {filters && filters.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {filters.sizes.map((size) => {
              const active = current.sizes.includes(size.sizeId);

              return (
                <button
                  key={size.sizeId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => go({ sizes: toggle(current.sizes, size.sizeId) })}
                  className={`min-w-10 rounded border px-3 py-1.5 ${
                    active ? "border-black bg-black text-white" : "border-zinc-300 hover:border-black"
                  }`}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {filters && filters.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Color</legend>
          <div className="flex flex-wrap gap-2">
            {filters.colors.map((color) => {
              const active = current.colors.includes(color.colorId);

              return (
                <button
                  key={color.colorId}
                  type="button"
                  aria-pressed={active}
                  title={color.name}
                  onClick={() => go({ colors: toggle(current.colors, color.colorId) })}
                  className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                    active ? "border-black ring-1 ring-black" : "border-zinc-300 hover:border-black"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: color.hexCode ?? "#e4e4e7" }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 font-semibold">
          Price{filters?.minPrice != null && filters.maxPrice != null ? ` (${filters.minPrice} - ${filters.maxPrice})` : ""}
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="decimal"
            aria-label="Minimum price"
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-full rounded border border-zinc-300 px-2 py-1.5"
          />
          <span>-</span>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            aria-label="Maximum price"
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-full rounded border border-zinc-300 px-2 py-1.5"
          />
        </div>
        <button
          type="button"
          onClick={() => go({ minPrice, maxPrice })}
          className="mt-2 w-full rounded border border-zinc-300 py-1.5 hover:border-black"
        >
          Apply price
        </button>
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            go({ sizes: [], colors: [], minPrice: "", maxPrice: "", onSale: false, inStock: false });
          }}
          className="text-zinc-600 underline hover:text-black"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
