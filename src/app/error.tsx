"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold">We could not load this page</h1>
      <p className="mt-2 text-zinc-600">The store is temporarily unavailable. Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}
