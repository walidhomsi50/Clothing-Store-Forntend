"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [text, setText] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const term = text.trim();
    router.push(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <form onSubmit={submit} role="search" className="w-full max-w-xs">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search products"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
      />
    </form>
  );
}
