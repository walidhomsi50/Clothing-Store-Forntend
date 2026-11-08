import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
