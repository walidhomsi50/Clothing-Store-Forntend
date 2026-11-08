import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";
import HeaderActions from "./HeaderActions";
import SearchBox from "./SearchBox";

async function CategoryLinks() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch {
    // The menu simply stays short when the API is unreachable
  }

  const topLevel = categories.filter((category) => category.parentCategoryId === null);

  return (
    <>
      <Link href="/shop?sort=newest" className="whitespace-nowrap hover:underline">
        New
      </Link>
      {topLevel.map((category) => (
        <Link key={category.categoryId} href={`/category/${category.slug}`} className="whitespace-nowrap hover:underline">
          {category.name}
        </Link>
      ))}
      <Link href="/shop?onSale=true" className="whitespace-nowrap text-red-600 hover:underline">
        Sale
      </Link>
    </>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {SITE_NAME}
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBox />
        </div>

        <HeaderActions />
      </div>

      <nav aria-label="Categories" className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm font-medium">
          <Suspense fallback={<span className="h-5 w-48 animate-pulse rounded bg-zinc-100" />}>
            <CategoryLinks />
          </Suspense>
        </div>
      </nav>

      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
