import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderDetailPage } from "@/components/AccountArea";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  return <OrderDetailPage id={orderId} />;
}

export default function AccountOrderPage(props: PageProps<"/account/orders/[id]">) {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My account</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
        <Content params={props.params} />
      </Suspense>
    </div>
  );
}
