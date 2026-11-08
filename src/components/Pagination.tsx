import Link from "next/link";

type Props = {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
};

function href(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  if (page > 1) search.set("page", String(page));

  const text = search.toString();
  return text ? `${basePath}?${text}` : basePath;
}

export default function Pagination({ basePath, params, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const first = Math.max(1, Math.min(page - 2, totalPages - 4));
  const last = Math.min(totalPages, first + 4);
  const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index);

  const base = "rounded border px-3 py-1.5 text-sm";

  return (
    <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(basePath, params, page - 1)} className={`${base} border-zinc-300 hover:border-black`}>
          Previous
        </Link>
      )}

      {pages.map((number) => (
        <Link
          key={number}
          href={href(basePath, params, number)}
          aria-current={number === page ? "page" : undefined}
          className={`${base} ${number === page ? "border-black bg-black text-white" : "border-zinc-300 hover:border-black"}`}
        >
          {number}
        </Link>
      ))}

      {page < totalPages && (
        <Link href={href(basePath, params, page + 1)} className={`${base} border-zinc-300 hover:border-black`}>
          Next
        </Link>
      )}
    </nav>
  );
}
