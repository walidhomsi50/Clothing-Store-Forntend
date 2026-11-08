// Server-side settings. Set them in .env.local (see .env.local.example).

/** Address of the ASP.NET API, without a trailing slash. */
export const API_BASE_URL = (process.env.API_BASE_URL ?? "https://localhost:44371").replace(/\/+$/, "");

/** Store name shown in the header, footer and page titles. */
export const SITE_NAME = process.env.SITE_NAME ?? "Clothing Store";

/** Public address of this website (used for link previews). */
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
