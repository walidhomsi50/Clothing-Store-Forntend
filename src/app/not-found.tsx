import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-zinc-600">The page you are looking for does not exist or is no longer available.</p>
      <Link href="/shop" className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800">
        Continue shopping
      </Link>
    </div>
  );
}
