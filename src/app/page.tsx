import Link from "next/link";
import { Suspense } from "react";
import ProductGrid, { ProductGridSkeleton } from "@/components/ProductGrid";
import { getCategories, getProducts } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";

async function CategoryTiles() {
  const categories = await getCategories();
  const topLevel = categories.filter((category) => category.parentCategoryId === null && category.productCount > 0);

  if (topLevel.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Shop by category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {topLevel.slice(0, 8).map((category) => (
          <Link
            key={category.categoryId}
            href={`/category/${category.slug}`}
            className="flex aspect-[4/3] items-end rounded-lg bg-zinc-100 p-4 transition hover:bg-zinc-200"
          >
            <span>
              <span className="block text-lg font-semibold">{category.name}</span>
              <span className="text-sm text-zinc-500">{category.productCount} products</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function ProductRow({ title, href, params }: { title: string; href: string; params: Record<string, string> }) {
  const result = await getProducts({ ...params, pageSize: "8" });

  if (!result || result.items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href={href} className="text-sm underline hover:text-zinc-600">
          View all
        </Link>
      </div>
      <ProductGrid products={result.items} />
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-zinc-900 px-6 py-16 text-center text-white md:py-24">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{SITE_NAME}</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-300">New styles every week. Order online and pay in cash when it arrives.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-medium text-black hover:bg-zinc-200">
          Shop now
        </Link>
      </section>

      <Suspense fallback={null}>
        <CategoryTiles />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <ProductRow title="New arrivals" href="/shop?sort=newest" params={{ sort: "newest" }} />
      </Suspense>

      <Suspense fallback={null}>
        <ProductRow title="On sale" href="/shop?onSale=true" params={{ onSale: "true" }} />
      </Suspense>
    </div>
  );
}
