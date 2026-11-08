import Link from "next/link";
import Price from "./Price";
import type { ProductListItem } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
        {product.mainImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.mainImageUrl}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              product.secondImageUrl ? "group-hover:opacity-0" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">No image</div>
        )}

        {product.secondImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.secondImageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">Sale</span>}
          {product.isNew && <span className="rounded bg-black px-2 py-0.5 text-xs font-medium text-white">New</span>}
          {!product.inStock && (
            <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs font-medium text-white">Sold out</span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {product.brand && <p className="text-xs uppercase tracking-wide text-zinc-500">{product.brand}</p>}
        <h3 className="text-sm font-medium group-hover:underline">{product.name}</h3>
        <Price price={product.price} salePrice={product.salePrice} currency={product.currency} />

        {product.colors.length > 0 && (
          <div className="flex gap-1 pt-1">
            {product.colors.slice(0, 6).map((color) => (
              <span
                key={color.colorId}
                title={color.name}
                className="h-3.5 w-3.5 rounded-full border border-zinc-300"
                style={{ backgroundColor: color.hexCode ?? "#e4e4e7" }}
              />
            ))}
            {product.colors.length > 6 && <span className="text-xs text-zinc-500">+{product.colors.length - 6}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
