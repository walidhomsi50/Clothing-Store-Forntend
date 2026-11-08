import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-zinc-600">Quality clothing, delivered to your door. Pay in cash when it arrives.</p>
        </div>

        <div>
          <p className="font-semibold">Shop</p>
          <ul className="mt-2 space-y-1 text-zinc-600">
            <li>
              <Link href="/shop" className="hover:underline">
                All products
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" className="hover:underline">
                New arrivals
              </Link>
            </li>
            <li>
              <Link href="/shop?onSale=true" className="hover:underline">
                Sale
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Account</p>
          <ul className="mt-2 space-y-1 text-zinc-600">
            <li>
              <Link href="/account" className="hover:underline">
                My account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
        © {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
