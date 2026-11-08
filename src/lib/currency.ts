// Currency for the cart (the cart API does not send one). Keep it equal to PricingHelper.Currency
// in the ASP.NET project. Set NEXT_PUBLIC_CURRENCY in .env.local to change it.
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";
