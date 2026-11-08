import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
