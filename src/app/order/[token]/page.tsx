import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import OrderSummary from "@/components/OrderSummary";
import { getTrackedOrder } from "@/lib/api";
import type { RawSearchParams } from "@/components/ShopListing";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function OrderContent({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await params;
  const { placed } = await searchParams;

  if (!GUID.test(token)) notFound();

  const order = await getTrackedOrder(token);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {placed && (
        <div className="mb-8 rounded-lg bg-green-50 px-6 py-5 text-green-900">
          <h1 className="text-2xl font-bold">Thank you for your order!</h1>
          <p className="mt-1 text-sm">
            Your order number is <strong>{order.orderNumber}</strong>. Save this page to check your order later.
            {order.paymentMethod === "COD" && " You pay in cash when it arrives."}
          </p>
        </div>
      )}

      <OrderSummary order={order} />

      <p className="mt-10 text-center">
        <Link href="/shop" className="rounded-full border border-zinc-300 px-6 py-3 text-sm hover:border-black">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}

export default function OrderPage(props: PageProps<"/order/[token]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-lg bg-zinc-100" />}>
      <OrderContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
