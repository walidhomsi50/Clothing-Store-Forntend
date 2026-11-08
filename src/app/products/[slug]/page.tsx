import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import ProductPurchase from "@/components/ProductPurchase";
import { getProduct, getRelated } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product not found" };

  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0];

  return {
    title: product.name,
    description: product.description?.slice(0, 160) ?? undefined,
    openGraph: mainImage ? { images: [mainImage.imageUrl] } : undefined,
  };
}

async function RelatedProducts({ slug }: { slug: string }) {
  const related = await getRelated(slug);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-4 text-2xl font-bold">You may also like</h2>
      <ProductGrid products={related.slice(0, 4)} />
    </section>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-500">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        {product.categorySlug && product.categoryName && (
          <>
            {" / "}
            <Link href={`/category/${product.categorySlug}`} className="hover:underline">
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand && <p className="text-sm uppercase tracking-wide text-zinc-500">{product.brand}</p>}
          <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>

          <ProductPurchase product={product} />

          {product.description && (
            <div className="mt-10 border-t border-zinc-200 pt-6">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <RelatedProducts slug={slug} />
      </Suspense>
    </>
  );
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-zinc-100" />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}
