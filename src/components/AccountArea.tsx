"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import AddressForm from "./AddressForm";
import OrderSummary, { StatusBadge } from "./OrderSummary";
import { useStore } from "./Providers";
import { bff } from "@/lib/bff";
import { useBff } from "@/lib/useBff";
import { CURRENCY } from "@/lib/currency";
import { formatDate, formatPrice } from "@/lib/format";
import type { Address, AddressInput, OrderDetails, OrderListItem, Paged } from "@/lib/types";

const field = "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black";

/** Sends visitors who are not logged in to the login page. */
export function RequireLogin({ children, next }: { children: ReactNode; next: string }) {
  const { user, authLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [authLoading, user, router, next]);

  if (authLoading || !user) return <p className="py-10 text-center text-zinc-500">Loading...</p>;

  return <>{children}</>;
}

function AccountNav({ current }: { current: "profile" | "orders" | "addresses" }) {
  const link = (href: string, label: string, key: string) => (
    <Link
      href={href}
      aria-current={current === key ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm ${current === key ? "bg-black text-white" : "border border-zinc-300 hover:border-black"}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label="Account">
      {link("/account", "Profile", "profile")}
      {link("/account/orders", "Orders", "orders")}
      {link("/account/addresses", "Addresses", "addresses")}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
function ProfileContent() {
  const { user, refreshUser } = useStore();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [changing, setChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await bff<unknown>("customers/me", "PUT", form);

    if (result.ok) {
      await refreshUser();
      setMessage({ kind: "ok", text: "Your details were saved." });
    } else {
      setMessage({ kind: "error", text: result.message });
    }

    setSaving(false);
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setChanging(true);
    setPasswordMessage(null);

    const result = await bff<unknown>("customers/change-password", "POST", passwords);

    if (result.ok) {
      setPasswords({ currentPassword: "", newPassword: "" });
      setPasswordMessage({ kind: "ok", text: "Your password was changed." });
    } else {
      setPasswordMessage({ kind: "error", text: result.message });
    }

    setChanging(false);
  }

  const notice = (value: { kind: "ok" | "error"; text: string } | null) =>
    value && (
      <p role="status" className={`text-sm ${value.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
        {value.text}
      </p>
    );

  return (
    <>
      <AccountNav current="profile" />

      <div className="grid gap-10 md:grid-cols-2">
        <form onSubmit={saveProfile} className="space-y-4">
          <h2 className="text-lg font-semibold">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              First name
              <input className={field} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required maxLength={100} />
            </label>
            <label className="text-sm">
              Last name
              <input className={field} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required maxLength={100} />
            </label>
          </div>
          <label className="block text-sm">
            Email
            <input className={field} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="block text-sm">
            Phone
            <input className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
          </label>
          {notice(message)}
          <button type="submit" disabled={saving} className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-300">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <form onSubmit={changePassword} className="space-y-4">
          <h2 className="text-lg font-semibold">Change password</h2>
          <label className="block text-sm">
            Current password
            <input className={field} type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required autoComplete="current-password" />
          </label>
          <label className="block text-sm">
            New password
            <input className={field} type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={8} autoComplete="new-password" />
          </label>
          {notice(passwordMessage)}
          <button type="submit" disabled={changing} className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium hover:border-black disabled:opacity-50">
            {changing ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>
    </>
  );
}

export function ProfilePage() {
  // The forms are created only once the visitor is known, so they start with the right values
  return (
    <RequireLogin next="/account">
      <ProfileContent />
    </RequireLogin>
  );
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

// One chunk = one page of the order list. "Show more" adds the next chunk below.
function OrdersChunk({ page, onMore }: { page: number; onMore: () => void }) {
  const { data, error, loading } = useBff<Paged<OrderListItem>>(`v1/orders?page=${page}&pageSize=10`);

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <p className="py-4 text-center text-zinc-500">Loading...</p>}

      {data && data.items.length === 0 && page === 1 && (
        <p className="py-10 text-center text-zinc-500">
          You have not placed any orders yet.{" "}
          <Link href="/shop" className="font-medium text-black underline">
            Start shopping
          </Link>
        </p>
      )}

      {data && (
        <ul className="space-y-3">
          {data.items.map((order) => (
            <li key={order.orderId}>
              <Link
                href={`/account/orders/${order.orderId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 hover:border-black"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(order.orderDate)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold">{formatPrice(order.totalAmount, CURRENCY)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.page < data.totalPages && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onMore}
            className="rounded-full border border-zinc-300 px-6 py-2 text-sm hover:border-black"
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}

export function OrdersPage() {
  const [pages, setPages] = useState(1);

  return (
    <RequireLogin next="/account/orders">
      <AccountNav current="orders" />

      {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
        // Earlier chunks keep their own "Show more" hidden once a later chunk exists
        <div key={page} className={page < pages ? "mb-3 [&_button]:hidden" : ""}>
          <OrdersChunk page={page} onMore={() => setPages((value) => value + 1)} />
        </div>
      ))}
    </RequireLogin>
  );
}

export function OrderDetailPage({ id }: { id: number }) {
  const { data: order, error, status, loading, reload } = useBff<OrderDetails>(`v1/orders/${id}`);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm("Cancel this order?")) return;

    setCancelling(true);
    setActionError(null);

    const result = await bff<unknown>(`v1/orders/${id}/cancel`, "POST");

    if (result.ok) reload();
    else setActionError(result.message);

    setCancelling(false);
  }

  const shownError = actionError ?? (error ? (status === 404 ? "This order was not found." : error) : null);

  return (
    <RequireLogin next={`/account/orders/${id}`}>
      <p className="mb-6">
        <Link href="/account/orders" className="text-sm text-zinc-600 underline hover:text-black">
          ← All orders
        </Link>
      </p>

      {loading && <p className="text-zinc-500">Loading...</p>}

      {shownError && (
        <p role="alert" className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {shownError}
        </p>
      )}

      {order && (
        <>
          <OrderSummary order={order} />

          {order.status === "Pending" && (
            <button
              type="button"
              onClick={cancel}
              disabled={cancelling}
              className="mt-8 rounded-full border border-red-300 px-5 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel this order"}
            </button>
          )}
        </>
      )}
    </RequireLogin>
  );
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------
export function AddressesPage() {
  const { data, error: loadError, loading, reload } = useBff<Address[]>("customer-addresses");
  const addresses = data ?? [];
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  const error = actionError ?? loadError;

  async function save(value: AddressInput): Promise<string | null> {
    const result =
      editing && editing !== "new"
        ? await bff<unknown>(`customer-addresses/${editing.customerAddressId}`, "PUT", value)
        : await bff<unknown>("customer-addresses", "POST", value);

    if (!result.ok) return result.message;

    setEditing(null);
    reload();
    return null;
  }

  async function remove(address: Address) {
    if (!window.confirm(`Delete the address "${address.title}"?`)) return;

    const result = await bff<unknown>(`customer-addresses/${address.customerAddressId}`, "DELETE");

    if (result.ok) reload();
    else setActionError(result.message);
  }

  async function makeDefault(address: Address) {
    const result = await bff<unknown>(`customer-addresses/${address.customerAddressId}`, "PUT", {
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      area: address.area ?? "",
      building: address.building ?? "",
      floor: address.floor ?? "",
      apartment: address.apartment ?? "",
      notes: address.notes ?? "",
      isDefault: true,
    });

    if (result.ok) reload();
    else setActionError(result.message);
  }

  return (
    <RequireLogin next="/account/addresses">
      <AccountNav current="addresses" />

      {error && (
        <p role="alert" className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {editing ? (
        <div className="max-w-2xl rounded-lg border border-zinc-200 p-6">
          <h2 className="mb-4 text-lg font-semibold">{editing === "new" ? "New address" : "Edit address"}</h2>
          <AddressForm
            key={editing === "new" ? "new" : editing.customerAddressId}
            initial={editing === "new" ? null : editing}
            submitLabel="Save address"
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <>
          {loading && <p className="text-zinc-500">Loading...</p>}

          {!loading && addresses.length === 0 && !error && <p className="text-zinc-500">You have no saved addresses yet.</p>}

          <ul className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <li key={address.customerAddressId} className="rounded-lg border border-zinc-200 p-4 text-sm">
                <p className="font-medium">
                  {address.title}
                  {address.isDefault && <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs">Default</span>}
                </p>
                <p className="mt-1 text-zinc-600">
                  {address.fullName}, {address.phone}
                  <br />
                  {address.addressLine}, {address.city}
                  {address.area ? `, ${address.area}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setEditing(address)} className="underline hover:text-black">
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button type="button" onClick={() => makeDefault(address)} className="underline hover:text-black">
                      Make default
                    </button>
                  )}
                  <button type="button" onClick={() => remove(address)} className="text-red-700 underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setEditing("new")}
            className="mt-6 rounded-full border border-zinc-300 px-5 py-2 text-sm hover:border-black"
          >
            + Add an address
          </button>
        </>
      )}
    </RequireLogin>
  );
}
