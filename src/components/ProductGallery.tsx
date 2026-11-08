"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">No image</div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.imageUrl}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show picture ${index + 1}`}
              aria-current={index === selected}
              className={`aspect-square overflow-hidden rounded border-2 ${
                index === selected ? "border-black" : "border-transparent hover:border-zinc-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
