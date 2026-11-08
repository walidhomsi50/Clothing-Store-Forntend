"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "./Providers";
import Price from "./Price";
import type { ProductDetails, Variant } from "@/lib/types";

export default function ProductPurchase({ product }: { product: ProductDetails }) {
  const { addToCart } = useStore();

  const [colorId, setColorId] = useState<number | null>(product.colors.length === 1 ? product.colors[0].colorId : null);
  const [sizeId, setSizeId] = useState<number | null>(product.sizes.length === 1 ? product.sizes[0].sizeId : null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const needsColor = product.colors.length > 0;
  const needsSize = product.sizes.length > 0;

  // The exact variant once every option has been chosen
  const variant: Variant | null = useMemo(() => {
    if (needsColor && colorId === null) return null;
    if (needsSize && sizeId === null) return null;

    return (
      product.variants.find(
        (candidate) =>
          (!needsColor || candidate.colorId === colorId) && (!needsSize || candidate.sizeId === sizeId),
      ) ?? null
    );
  }, [product.variants, needsColor, needsSize, colorId, sizeId]);

  // Is some variant in stock for this color / size combination with the OTHER option as chosen?
  function optionInStock(kind: "color" | "size", id: number): boolean {
    return product.variants.some(
      (candidate) =>
        candidate.inStock &&
        (kind === "color" ? candidate.colorId === id : candidate.sizeId === id) &&
        (kind === "color" ? sizeId === null || candidate.sizeId === sizeId : colorId === null || candidate.colorId === colorId),
    );
  }

  const shownPrice = variant?.price ?? product.salePrice ?? product.price;
  const shownOriginal = variant ? variant.originalPrice : product.salePrice != null ? product.price : null;
  const maxQuantity = Math.max(1, variant?.availableQuantity ?? 1);

  async function add() {
    if (!variant) {
      setMessage({ kind: "error", text: needsSize && sizeId === null ? "Please choose a size." : "Please choose a color." });
      return;
    }

    setBusy(true);
    setMessage(null);

    const error = await addToCart(variant.productVariantId, quantity);

    setBusy(false);
    setMessage(error ? { kind: "error", text: error } : { kind: "ok", text: "Added to your cart." });
  }

  const unavailable = !product.inStock || (variant !== null && !variant.inStock);

  return (
    <div className="space-y-6">
      <Price price={shownOriginal ?? shownPrice} salePrice={shownOriginal != null ? shownPrice : null} currency={product.currency} size="lg" />

      {needsColor && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            Color{colorId !== null ? `: ${product.colors.find((color) => color.colorId === colorId)?.name ?? ""}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => {
              const active = color.colorId === colorId;
              const available = optionInStock("color", color.colorId);

              return (
                <button
                  key={color.colorId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setColorId(color.colorId);
                    setQuantity(1);
                  }}
                  className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${
                    active ? "border-black ring-1 ring-black" : "border-zinc-300 hover:border-black"
                  } ${available ? "" : "opacity-40"}`}
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

      {needsSize && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const active = size.sizeId === sizeId;
              const available = optionInStock("size", size.sizeId);

              return (
                <button
                  key={size.sizeId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSizeId(size.sizeId);
                    setQuantity(1);
                  }}
                  className={`min-w-12 rounded border px-3 py-2 text-sm ${
                    active ? "border-black bg-black text-white" : "border-zinc-300 hover:border-black"
                  } ${available ? "" : "opacity-40 line-through"}`}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-semibold">
          Quantity
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
        >
          {Array.from({ length: maxQuantity }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={busy || unavailable}
        className="w-full rounded-full bg-black py-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {unavailable ? "Sold out" : busy ? "Adding..." : "Add to cart"}
      </button>

      {message && (
        <p role="status" className={`text-sm ${message.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
          {message.text}{" "}
          {message.kind === "ok" && (
            <Link href="/cart" className="font-medium underline">
              View cart
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
