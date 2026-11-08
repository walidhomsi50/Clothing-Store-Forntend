import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ProductGrid";
import ShopListing, { type RawSearchParams } from "@/components/ShopListing";

export const metadata: Metadata = { title: "Shop" };

async function ShopContent({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <ShopListing basePath="/shop" searchParams={await searchParams} heading="All products" />;
}

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ShopContent searchParams={props.searchParams} />
    </Suspense>
  );
}
