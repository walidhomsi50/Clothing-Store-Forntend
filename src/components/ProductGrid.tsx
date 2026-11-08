import ProductCard from "./ProductCard";
import type { ProductListItem } from "@/lib/types";

export default function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[3/4] rounded-lg bg-zinc-200" />
          <div className="mt-3 h-3 w-3/4 rounded bg-zinc-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
