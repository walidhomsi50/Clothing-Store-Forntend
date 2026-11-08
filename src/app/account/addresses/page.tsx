import type { Metadata } from "next";
import { AddressesPage } from "@/components/AccountArea";

export const metadata: Metadata = { title: "My addresses", robots: { index: false } };

export default function AccountAddressesPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My account</h1>
      <AddressesPage />
    </div>
  );
}
