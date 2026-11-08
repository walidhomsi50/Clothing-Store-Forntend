import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ProductGrid";
import ShopListing, { type RawSearchParams } from "@/components/ShopListing";
import { getCategories } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);

  return category
    ? { title: category.name, description: category.description ?? undefined }
    : { title: "Category not found" };
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);

  if (!category) notFound();

  return (
    <ShopListing
      basePath={`/category/${category.slug}`}
      categorySlug={category.slug}
      searchParams={await searchParams}
      heading={category.name}
      description={category.description}
    />
  );
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <CategoryContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
