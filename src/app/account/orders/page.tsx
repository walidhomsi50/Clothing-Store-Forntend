import type { Metadata } from "next";
import { OrdersPage } from "@/components/AccountArea";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default function AccountOrdersPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My account</h1>
      <OrdersPage />
    </div>
  );
}
