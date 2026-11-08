# Clothing store: storefront (Next.js)

The customer-facing website. It talks to your ASP.NET API and never to the database directly.

## What you need

- **Node.js 20.9 or newer** (22 LTS recommended). Check with `node -v`. Download from nodejs.org if needed.
- Your ASP.NET API running (press F5 in Visual Studio).

## First run

1. Open a terminal in this folder and run `npm install` (once).
2. Copy `.env.local.example` to `.env.local`.
3. Open `.env.local` and set `API_BASE_URL` to the **https address Visual Studio opens** for your API
   (for example `https://localhost:44371`, no slash at the end).
4. Run `npm run dev` and open http://localhost:3000.

Restart `npm run dev` after every change to `.env.local`.

> The line `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local` is for development only. Visual Studio's https address
> uses a self-signed certificate that Node would otherwise refuse. **Remove that line when you deploy.**

## What is included

| Page | Address |
|---|---|
| Home (new arrivals, sale, categories) | `/` |
| All products with filters, sorting, paging | `/shop` |
| Category (includes sub-categories) | `/category/<slug>` |
| Product page (gallery, color and size pickers) | `/products/<slug>` |
| Cart | `/cart` |
| Checkout (guest or logged in, cash on delivery) | `/checkout` |
| Order confirmation / guest tracking link | `/order/<token>` |
| Log in, create account | `/login`, `/register` |
| My account: profile, orders, addresses | `/account`, `/account/orders`, `/account/addresses` |

Card payment is shown as "Coming soon" until the payment gateway is connected on the API side.

## How it works

- **The browser only talks to this website.** Calls go to `/api/backend/...`, which forwards them to the ASP.NET API.
  So you do not need any CORS setting for this site.
- **Login tokens never reach JavaScript.** They are stored in httpOnly cookies (`sf_access`, `sf_refresh`).
  The proxy adds the token to each request and renews it automatically when it expires (every 15 minutes).
- **Guests keep a cart** through a random id in the `sf_guest` cookie. When a guest logs in, the cart is merged.
- **Only a fixed list of API paths is reachable** through the proxy (cart, orders, checkout, profile, addresses).
  Admin endpoints are not on that list, so they cannot be called from the website.
- **Product images** are served through `/uploads/...` on this site, fetched from the API server.

Key files:

- `src/app/api/backend/[...path]/route.ts`: the proxy and its allow-list
- `src/app/api/session/*`: login, register, logout (sets and clears the cookies)
- `src/lib/api.ts`: catalog requests made on the server
- `src/components/Providers.tsx`: account and cart state shared by all pages

## Deploying later

1. `npm run build` then `npm start` (or deploy to a host that runs Node.js).
2. Set `API_BASE_URL` to the **public https address** of the API, `SITE_URL` to the public address of this site,
   and remove `NODE_TLS_REJECT_UNAUTHORIZED`.
3. Serve the site over https (the login cookies are marked secure in production).
4. If you run more than one copy of this site behind a load balancer, use sticky sessions: the login renewal is
   coordinated inside one running copy.
