"use client";

import Link from "next/link";
import { useState } from "react";
import Price from "./Price";
import { useStore } from "./Providers";
import { CURRENCY } from "@/lib/currency";
import { formatPrice } from "@/lib/format";

export default function CartView() {
  const { cart, cartLoading, updateCartItem, removeCartItem } = useStore();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (cartLoading && !cart) {
    return <p className="py-10 text-center text-zinc-500">Loading your cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/shop" className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800">
          Continue shopping
        </Link>
      </div>
    );
  }

  const hasUnavailable = cart.items.some((item) => !item.isAvailable);

  async function change(cartItemId: number, quantity: number) {
    setBusyId(cartItemId);
    setError(null);
    const message = await updateCartItem(cartItemId, quantity);
    if (message) setError(message);
    setBusyId(null);
  }

  async function remove(cartItemId: number) {
    setBusyId(cartItemId);
    setError(null);
    const message = await removeCartItem(cartItemId);
    if (message) setError(message);
    setBusyId(null);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {error && (
          <p role="alert" className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {cart.items.map((item) => (
            <li key={item.cartItemId} className={`flex gap-4 py-5 ${item.isAvailable ? "" : "opacity-60"}`}>
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded bg-zinc-100">
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-zinc-500">
                    {[item.colorName, item.sizeName].filter(Boolean).join(" / ")}
                  </p>
                  {!item.isAvailable && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      No longer available in this quantity. Change it or remove it to continue.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label htmlFor={`qty-${item.cartItemId}`} className="sr-only">
                      Quantity
                    </label>
                    <select
                      id={`qty-${item.cartItemId}`}
                      value={Math.min(item.quantity, Math.max(item.availableQuantity, 1))}
                      disabled={busyId === item.cartItemId || item.availableQuantity === 0}
                      onChange={(event) => change(item.cartItemId, Number(event.target.value))}
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
                    >
                      {Array.from({ length: Math.max(item.availableQuantity, 1) }, (_, index) => index + 1).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => remove(item.cartItemId)}
                      disabled={busyId === item.cartItemId}
                      className="text-sm text-zinc-500 underline hover:text-black"
                    >
                      Remove
                    </button>
                  </div>

                  <Price price={item.totalPrice} currency={CURRENCY} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-lg border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Items ({cart.totalItems})</dt>
            <dd>{formatPrice(cart.totalAmount, CURRENCY)}</dd>
          </div>
          <div className="flex justify-between text-zinc-500">
            <dt>Delivery</dt>
            <dd>Confirmed when you order</dd>
          </div>
        </dl>

        <p className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(cart.totalAmount, CURRENCY)}</span>
        </p>

        {hasUnavailable ? (
          <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Some items are not available. Update your cart to continue.
          </p>
        ) : (
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-black py-3 text-center font-medium text-white hover:bg-zinc-800"
          >
            Checkout
          </Link>
        )}
      </aside>
    </div>
  );
}
