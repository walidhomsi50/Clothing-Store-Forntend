import Link from "next/link";
import { getCategories, getFilters, getProducts } from "@/lib/api";
import FiltersPanel, { type CurrentFilters } from "./FiltersPanel";
import Pagination from "./Pagination";
import ProductGrid from "./ProductGrid";

export type RawSearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function ids(value: string | string[] | undefined): number[] {
  return first(value)
    .split(",")
    .map((piece) => Number(piece))
    .filter((number) => Number.isInteger(number) && number > 0);
}

type Props = {
  basePath: string;
  categorySlug?: string;
  searchParams: RawSearchParams;
  heading: string;
  description?: string | null;
};

/** Product grid with filters, shared by /shop and /category/[slug]. */
export default async function ShopListing({ basePath, categorySlug, searchParams, heading, description }: Props) {
  const current: CurrentFilters = {
    sizes: ids(searchParams.sizes),
    colors: ids(searchParams.colors),
    minPrice: first(searchParams.minPrice),
    maxPrice: first(searchParams.maxPrice),
    onSale: first(searchParams.onSale) === "true",
    inStock: first(searchParams.inStock) === "true",
    sort: first(searchParams.sort) || "newest",
    search: first(searchParams.search),
  };

  const page = Math.max(1, Number(first(searchParams.page)) || 1);

  const query = {
    categorySlug,
    search: current.search || undefined,
    sizes: current.sizes.length ? current.sizes.join(",") : undefined,
    colors: current.colors.length ? current.colors.join(",") : undefined,
    minPrice: current.minPrice || undefined,
    maxPrice: current.maxPrice || undefined,
    onSale: current.onSale ? "true" : undefined,
    inStock: current.inStock ? "true" : undefined,
    sort: current.sort !== "newest" ? current.sort : undefined,
  };

  const [result, filters, categories] = await Promise.all([
    getProducts({ ...query, page: String(page), pageSize: "24" }),
    getFilters(categorySlug),
    getCategories(),
  ]);

  const currentCategory = categorySlug ? categories.find((category) => category.slug === categorySlug) : undefined;
  const children = currentCategory ? categories.filter((category) => category.parentCategoryId === currentCategory.categoryId) : [];

  const pageParams = {
    search: query.search,
    sizes: query.sizes,
    colors: query.colors,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    onSale: query.onSale,
    inStock: query.inStock,
    sort: query.sort,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{current.search ? `Results for “${current.search}”` : heading}</h1>
        {description && <p className="mt-2 max-w-2xl text-zinc-600">{description}</p>}

        {children.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.categoryId}
                href={`/category/${child.slug}`}
                className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:border-black"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <FiltersPanel
            key={JSON.stringify(current)}
            basePath={basePath}
            filters={filters}
            current={current}
          />
        </div>

        <div className="lg:col-span-3">
          {result && result.items.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-zinc-500">
                {result.totalItems} product{result.totalItems === 1 ? "" : "s"}
              </p>
              <ProductGrid products={result.items} />
              <Pagination basePath={basePath} params={pageParams} page={result.page} totalPages={result.totalPages} />
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-zinc-500">Try removing some filters.</p>
              <Link href={basePath} className="mt-4 inline-block rounded-full border border-zinc-300 px-5 py-2 text-sm hover:border-black">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
