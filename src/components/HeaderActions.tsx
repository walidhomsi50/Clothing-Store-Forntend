"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./Providers";

export default function HeaderActions() {
  const { user, authLoading, cartCount, logout } = useStore();
  const router = useRouter();

  async function signOut() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {authLoading ? (
        <span className="w-16" />
      ) : user ? (
        <div className="flex items-center gap-3">
          <Link href="/account" className="hover:underline">
            {user.firstName}
          </Link>
          <button type="button" onClick={signOut} className="text-zinc-500 hover:text-black hover:underline">
            Log out
          </button>
        </div>
      ) : (
        <Link href="/login" className="hover:underline">
          Log in
        </Link>
      )}

      <Link href="/cart" className="relative rounded-full border border-zinc-300 px-4 py-2 font-medium hover:border-black">
        Cart
        {cartCount > 0 && (
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs text-white">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
