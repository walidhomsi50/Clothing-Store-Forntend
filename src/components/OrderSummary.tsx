import { formatDate, formatPrice } from "@/lib/format";
import type { OrderDetails } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[status] ?? "bg-zinc-100 text-zinc-700"}`}>
      {status}
    </span>
  );
}

const PAYMENT_LABEL: Record<string, string> = { COD: "Cash on delivery", Card: "Card" };

/** Order details, used on the confirmation page and in the account area. */
export default function OrderSummary({ order }: { order: OrderDetails }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Order {order.orderNumber}</h2>
          <p className="text-sm text-zinc-500">Placed {formatDate(order.orderDate)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
        {order.items.map((item) => (
          <li key={item.orderItemId} className="flex gap-4 py-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-zinc-500">{[item.colorName, item.sizeName].filter(Boolean).join(" / ")}</p>
                <p className="text-zinc-500">
                  {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.totalPrice, order.currency)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="text-sm">
          <h3 className="mb-2 font-semibold">Delivery address</h3>
          <p className="whitespace-pre-line text-zinc-700">{order.shippingAddress}</p>
          {order.contactEmail && <p className="mt-2 text-zinc-500">{order.contactEmail}</p>}
          {order.notes && (
            <p className="mt-2 text-zinc-500">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          )}
        </div>

        <div className="text-sm">
          <h3 className="mb-2 font-semibold">Payment</h3>
          <p className="text-zinc-700">
            {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod} · {order.paymentStatus}
          </p>

          <dl className="mt-4 space-y-1">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{order.shippingFee > 0 ? formatPrice(order.shippingFee, order.currency) : "Free"}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd>-{formatPrice(order.discountAmount, order.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalAmount, order.currency)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
