import type { Metadata } from "next";
import { ProfilePage } from "@/components/AccountArea";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My account</h1>
      <ProfilePage />
    </div>
  );
}
