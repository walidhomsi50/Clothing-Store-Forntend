import { formatPrice } from "@/lib/format";

type Props = {
  price: number;
  salePrice?: number | null;
  currency: string;
  size?: "sm" | "lg";
};

/** Shows the current price, with the old price crossed out when there is a discount. */
export default function Price({ price, salePrice, currency, size = "sm" }: Props) {
  const big = size === "lg" ? "text-2xl" : "text-sm";

  if (salePrice != null && salePrice < price) {
    return (
      <p className={`flex items-baseline gap-2 ${big}`}>
        <span className="font-semibold text-red-600">{formatPrice(salePrice, currency)}</span>
        <span className="text-zinc-400 line-through">{formatPrice(price, currency)}</span>
      </p>
    );
  }

  return <p className={`font-semibold ${big}`}>{formatPrice(price, currency)}</p>;
}
