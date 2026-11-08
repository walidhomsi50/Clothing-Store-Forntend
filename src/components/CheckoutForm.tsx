"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AddressForm from "./AddressForm";
import { useStore } from "./Providers";
import { bff } from "@/lib/bff";
import { useBff } from "@/lib/useBff";
import { CURRENCY } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import type { Address, AddressInput, OrderDetails, PaymentMethod } from "@/lib/types";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black";

type GuestDetails = {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  area: string;
  building: string;
  floor: string;
  apartment: string;
  addressNotes: string;
};

const emptyGuest: GuestDetails = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  area: "",
  building: "",
  floor: "",
  apartment: "",
  addressNotes: "",
};

export default function CheckoutForm() {
  const router = useRouter();
  const { user, authLoading, cart, cartLoading, refreshCart } = useStore();

  const methodsResult = useBff<PaymentMethod[]>("v1/checkout/payment-methods");
  const methods = methodsResult.data ?? [];

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [guest, setGuest] = useState<GuestDetails>(emptyGuest);

  const addressesResult = useBff<Address[]>(user ? "customer-addresses" : null);
  const addresses = addressesResult.data ?? [];
  const [chosenAddressId, setChosenAddressId] = useState<number | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  // The chosen address, or else the default one (or the first one)
  const preferredAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const addressId = chosenAddressId ?? (preferredAddress ? preferredAddress.customerAddressId : null);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveNewAddress(value: AddressInput): Promise<string | null> {
    const result = await bff<Address>("customer-addresses", "POST", value);
    if (!result.ok) return result.message;

    addressesResult.reload();
    setChosenAddressId(result.data.customerAddressId);
    setAddingAddress(false);
    return null;
  }

  async function placeOrder(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (user && addressId === null) {
      setError("Please choose or add a delivery address.");
      return;
    }

    setPlacing(true);

    const result = user
      ? await bff<OrderDetails>("v1/orders", "POST", { customerAddressId: addressId, paymentMethod, notes })
      : await bff<OrderDetails>("v1/orders/guest", "POST", { ...guest, paymentMethod, notes });

    if (!result.ok) {
      setError(result.message);
      setPlacing(false);
      return;
    }

    await refreshCart();
    router.push(`/order/${result.data.trackingToken}?placed=1`);
  }

  if ((cartLoading && !cart) || authLoading) {
    return <p className="py-10 text-center text-zinc-500">Loading...</p>;
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

  if (cart.items.some((item) => !item.isAvailable)) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium">Some items in your cart are no longer available</p>
        <Link href="/cart" className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800">
          Review your cart
        </Link>
      </div>
    );
  }

  function setGuestField<K extends keyof GuestDetails>(key: K, value: string) {
    setGuest((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        {/* Delivery details */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Delivery details</h2>

          {user ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.customerAddressId}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-4 text-sm ${
                    addressId === address.customerAddressId ? "border-black" : "border-zinc-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === address.customerAddressId}
                    onChange={() => setChosenAddressId(address.customerAddressId)}
                  />
                  <span>
                    <span className="font-medium">
                      {address.title}
                      {address.isDefault && <span className="ml-2 text-xs text-zinc-500">(default)</span>}
                    </span>
                    <br />
                    {address.fullName}, {address.phone}
                    <br />
                    {address.addressLine}, {address.city}
                    {address.area ? `, ${address.area}` : ""}
                  </span>
                </label>
              ))}

              {addingAddress ? (
                <div className="rounded-lg border border-zinc-200 p-4">
                  <AddressForm
                    submitLabel="Save address"
                    onSubmit={saveNewAddress}
                    onCancel={() => setAddingAddress(false)}
                    showDefault={addresses.length > 0}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingAddress(true)}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:border-black"
                >
                  + Add a new address
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="rounded bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                Checking out as a guest.{" "}
                <Link href="/login?next=/checkout" className="font-medium text-black underline">
                  Log in
                </Link>{" "}
                or{" "}
                <Link href="/register?next=/checkout" className="font-medium text-black underline">
                  create an account
                </Link>{" "}
                to save your details for next time.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Full name
                  <input className={field} value={guest.fullName} onChange={(e) => setGuestField("fullName", e.target.value)} required maxLength={150} autoComplete="name" />
                </label>
                <label className="text-sm">
                  Phone
                  <input className={field} value={guest.phone} onChange={(e) => setGuestField("phone", e.target.value)} required maxLength={30} inputMode="tel" autoComplete="tel" />
                </label>
                <label className="text-sm sm:col-span-2">
                  Email
                  <input className={field} type="email" value={guest.email} onChange={(e) => setGuestField("email", e.target.value)} required maxLength={255} autoComplete="email" />
                </label>
                <label className="text-sm sm:col-span-2">
                  Street address
                  <input className={field} value={guest.addressLine} onChange={(e) => setGuestField("addressLine", e.target.value)} required maxLength={300} autoComplete="street-address" />
                </label>
                <label className="text-sm">
                  City
                  <input className={field} value={guest.city} onChange={(e) => setGuestField("city", e.target.value)} required maxLength={100} />
                </label>
                <label className="text-sm">
                  Area
                  <input className={field} value={guest.area} onChange={(e) => setGuestField("area", e.target.value)} maxLength={100} />
                </label>
                <label className="text-sm">
                  Building
                  <input className={field} value={guest.building} onChange={(e) => setGuestField("building", e.target.value)} maxLength={50} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    Floor
                    <input className={field} value={guest.floor} onChange={(e) => setGuestField("floor", e.target.value)} maxLength={50} />
                  </label>
                  <label className="text-sm">
                    Apartment
                    <input className={field} value={guest.apartment} onChange={(e) => setGuestField("apartment", e.target.value)} maxLength={50} />
                  </label>
                </div>
                <label className="text-sm sm:col-span-2">
                  Delivery notes (optional)
                  <textarea className={field} rows={2} value={guest.addressNotes} onChange={(e) => setGuestField("addressNotes", e.target.value)} maxLength={500} />
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Payment */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Payment</h2>

          <div className="space-y-3">
            {(methods.length > 0 ? methods : [{ code: "COD", name: "Cash on delivery", enabled: true, message: null }]).map((method) => (
              <label
                key={method.code}
                className={`flex gap-3 rounded-lg border p-4 text-sm ${
                  method.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                } ${paymentMethod === method.code && method.enabled ? "border-black" : "border-zinc-200"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  disabled={!method.enabled}
                  checked={paymentMethod === method.code}
                  onChange={() => setPaymentMethod(method.code)}
                />
                <span>
                  <span className="font-medium">{method.name}</span>
                  {method.message && <span className="ml-2 text-xs text-zinc-500">({method.message})</span>}
                  {method.code === "COD" && <span className="block text-zinc-500">Pay in cash when your order arrives.</span>}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="order-notes" className="mb-2 block text-lg font-semibold">
            Order notes <span className="text-sm font-normal text-zinc-500">(optional)</span>
          </label>
          <textarea
            id="order-notes"
            className={field}
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={1000}
          />
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-lg border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold">Your order</h2>

        <ul className="mt-4 space-y-3 text-sm">
          {cart.items.map((item) => (
            <li key={item.cartItemId} className="flex justify-between gap-3">
              <span>
                {item.quantity} × {item.productName}
                <span className="block text-xs text-zinc-500">{[item.colorName, item.sizeName].filter(Boolean).join(" / ")}</span>
              </span>
              <span>{formatPrice(item.totalPrice, CURRENCY)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(cart.totalAmount, CURRENCY)}</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">The delivery fee, if any, is shown on your confirmation.</p>

        {error && (
          <p role="alert" className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={placing}
          className="mt-6 w-full rounded-full bg-black py-3 font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
        >
          {placing ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </form>
  );
}
