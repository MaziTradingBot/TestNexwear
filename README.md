# NexWear — Luxury Fashion E-Commerce

A premium, production-ready fashion storefront built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Prisma** and **PostgreSQL**. Editorial, light-luxury design inspired by Answear & Ted Baker.

> Deployable on **Render**, **Railway** or a **VPS**.

---

## ✨ Features

**Storefront**
- Editorial home page — hero slider (video-ready), 4-up category grid, new arrivals, trending, "Shop the Edit" splits, flash sale with countdown, brand marquee, Instagram gallery, newsletter
- Men / Women / Shoes listing pages with advanced filtering (category, price, color, size, brand, material, on-sale) + sorting + pagination
- Brands index + brand landing pages
- Sale page with live countdown timer
- Product detail page — zoomable gallery, color & size selectors, size guide, reviews, similar products, JSON-LD + dynamic OG metadata
- Live search overlay with suggestions & search history
- Cart (save-for-later, coupons, free-shipping progress) · Wishlist · Recently Viewed
- Multi-step checkout → shipping + delivery partners → **payment simulation** (Card / Apple Pay / Google Pay / Bank Transfer / Cash on Delivery) → order confirmation with tracking & ETA

**Accounts & commerce**
- Email auth: register, login, logout, forgot/reset password (JWT sessions + bcrypt via NextAuth credentials)
- Account dashboard — orders, tracking, addresses, loyalty points, change password
- Coupons, configurable shipping rates per country, loyalty points
- Worldwide shipping to **16 countries**, language switcher scaffold (8 locales)

**Engineering**
- Prisma schema covering products, variants, brands, categories, orders, payments, reviews, coupons, shipping, banners, newsletter
- Seed: **100 men's + 100 women's + 50 shoes + 20 brands** with realistic data & Unsplash imagery
- Security: bcrypt hashing, zod validation, in-memory rate limiting, security headers
- SEO: dynamic metadata, product schema, Open Graph, `sitemap.xml`, `robots.txt`
- Skeleton loading, image lazy-loading, smooth Framer Motion transitions

---

## 🧱 Tech Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 14 (App Router, RSC, route handlers as backend) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom luxury design system |
| Animation | Framer Motion + Embla Carousel |
| Auth | NextAuth (Credentials provider, JWT) + bcrypt |
| ORM / DB | Prisma + PostgreSQL |
| State | Zustand (cart, wishlist, recently-viewed, coupon, checkout) |

---

## 🚀 Getting Started (Local)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
#   → set DATABASE_URL (Render Postgres / local Postgres) and NEXTAUTH_SECRET

# 3. Create the schema + seed data
npx prisma migrate dev --name init   # or: npx prisma db push
npm run db:seed

# 4. Run the dev server
npm run dev      # http://localhost:3000
```

**Demo accounts** (created by the seed):
- Admin — `admin@nexwear.com` / `Admin123!`
- Customer — `customer@nexwear.com` / `Customer123!`

> No Postgres locally? Use the connection string from a free Render/Neon database in `DATABASE_URL` — everything else works the same.

---

## 📦 Project Structure

```
app/
  page.tsx                 Editorial home page
  (men|women|shoes)/       Department listing pages
  category/[slug]/         Generic category listing
  product/[slug]/          Product detail page (PDP)
  brands/[slug]/           Brand index + landing
  sale/  search/           Sale (countdown) + search results
  cart/  wishlist/         Bag & wishlist
  checkout/                Shipping → payment → success
  (login|register|forgot-password|reset-password)/
  account/                 User dashboard
  about|contact|faq|privacy|terms/
  api/                     Route handlers (auth, products, checkout, coupon, shipping, reviews, newsletter, contact)
  robots.ts  sitemap.ts    SEO
components/                Brand, layout, home, product, checkout, account, ui primitives, marketing
lib/                       prisma, auth, queries, validations, mailer, rate-limit, format, constants
store/                     Zustand stores
prisma/                    schema.prisma + seed.ts
render.yaml                Render Blueprint (web service + Postgres)
```

---

## ☁️ Deployment

### Render (one-click Blueprint)
1. Push this repo to GitHub.
2. In Render: **New + → Blueprint** and select the repo. `render.yaml` provisions the web service + Postgres.
3. After the first deploy, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Render URL (e.g. `https://nexwear.onrender.com`) and redeploy.
4. Seed once from the Render **Shell**: `npm run db:seed`.

The build runs `prisma db push` to sync the schema automatically.

### Railway
Create a Postgres plugin, set the env vars from `.env.example`, then:
- Build: `npm install --legacy-peer-deps && npx prisma db push && npm run build`
- Start: `npm run start`

### VPS
Provision Postgres, set env vars, then `npm ci --legacy-peer-deps && npx prisma db push && npm run build && npm run start` (behind Nginx/PM2).

---

## 🗺️ Roadmap (next phases)

Admin dashboard (products / orders / users / coupons / banners / analytics) · full 8-language translations · review image upload & moderation UI · product comparison & quick-view · lookbook · AI-style recommendations.

---

© 2026 NexWear. Built as a premium fashion marketplace reference implementation.
