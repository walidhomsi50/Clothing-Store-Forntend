"use client";

import { useState, type FormEvent } from "react";
import type { Address, AddressInput } from "@/lib/types";

type Props = {
  initial?: Address | null;
  submitLabel: string;
  onSubmit: (value: AddressInput) => Promise<string | null>;
  onCancel?: () => void;
  showDefault?: boolean;
};

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black";

export default function AddressForm({ initial, submitLabel, onSubmit, onCancel, showDefault = true }: Props) {
  const [value, setValue] = useState<AddressInput>({
    title: initial?.title ?? "Home",
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    addressLine: initial?.addressLine ?? "",
    city: initial?.city ?? "",
    area: initial?.area ?? "",
    building: initial?.building ?? "",
    floor: initial?.floor ?? "",
    apartment: initial?.apartment ?? "",
    notes: initial?.notes ?? "",
    isDefault: initial?.isDefault ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AddressInput>(key: K, next: AddressInput[K]) {
    setValue((previous) => ({ ...previous, [key]: next }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const message = await onSubmit(value);

    setBusy(false);
    if (message) setError(message);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Address name
          <input className={field} value={value.title} onChange={(e) => set("title", e.target.value)} required maxLength={50} />
        </label>
        <label className="text-sm">
          Full name
          <input className={field} value={value.fullName} onChange={(e) => set("fullName", e.target.value)} required maxLength={150} autoComplete="name" />
        </label>
        <label className="text-sm">
          Phone
          <input className={field} value={value.phone} onChange={(e) => set("phone", e.target.value)} required maxLength={30} inputMode="tel" autoComplete="tel" />
        </label>
        <label className="text-sm">
          City
          <input className={field} value={value.city} onChange={(e) => set("city", e.target.value)} required maxLength={100} />
        </label>
      </div>

      <label className="block text-sm">
        Street address
        <input className={field} value={value.addressLine} onChange={(e) => set("addressLine", e.target.value)} required maxLength={300} autoComplete="street-address" />
      </label>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm sm:col-span-1">
          Area
          <input className={field} value={value.area} onChange={(e) => set("area", e.target.value)} maxLength={100} />
        </label>
        <label className="text-sm">
          Building
          <input className={field} value={value.building} onChange={(e) => set("building", e.target.value)} maxLength={50} />
        </label>
        <label className="text-sm">
          Floor
          <input className={field} value={value.floor} onChange={(e) => set("floor", e.target.value)} maxLength={50} />
        </label>
        <label className="text-sm">
          Apartment
          <input className={field} value={value.apartment} onChange={(e) => set("apartment", e.target.value)} maxLength={50} />
        </label>
      </div>

      <label className="block text-sm">
        Delivery notes (optional)
        <textarea className={field} rows={2} value={value.notes} onChange={(e) => set("notes", e.target.value)} maxLength={500} />
      </label>

      {showDefault && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={value.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
          Use as my default address
        </label>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-zinc-300 px-5 py-2 text-sm hover:border-black">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
