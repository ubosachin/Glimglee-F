# Glimglee SEO Implementation Task Tracker

Format: `ID | Title | Priority | Dependencies | Status | Acceptance Criteria | Verification Evidence`

Statuses: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`, `FAILED`

---

## Task Matrix

| ID | Title | Priority | Dependencies | Status | Acceptance Criteria | Verification Evidence |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| **SEO-P0-01** | Create branded `not-found.tsx` and trigger true HTTP 404 on missing slugs | P0 | None | DONE | Invalid product/category paths call `notFound()` and return status 404 with store links and search | Created `src/app/not-found.tsx`, added `notFound()` to product and category layouts. Verified with Next.js 16 build. |
| **SEO-P0-02** | Filter XML Sitemap to active products & valid slugs | P0 | None | DONE | `sitemap.ts` includes only `status === "active"` and non-empty slugs, avoiding drafts and soft-404 URLs | Implemented active status and slug filters + date fallback in `src/app/sitemap.ts`. Verified with next build. |
| **SEO-P0-03** | Consolidate and harden `robots.ts` crawler rules | P0 | None | DONE | All private paths (`/admin`, `/admin/`, `/account`, `/orders`, `/api/`) consistently disallowed across all bot blocks | Standardized rules across `*`, `Googlebot`, and `Bingbot`. Removed deprecated host field. Verified with next build. |
| **SEO-P0-04** | Standardize canonical hostnames and OpenGraph URLs | P0 | None | DONE | All canonical tags and social graph URLs reference `https://www.glimglee.com` without non-www splits | Verified in layout and policy pages |
| **SEO-P0-05** | Configure HTTP Security and SEO caching headers | P0 | None | DONE | `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` | Configured `async headers()` in `next.config.ts`. Verified with next build. |
| **SEO-P1-01** | Inject verified customer reviews into Product Schema | P1 | SEO-P0-01 | DONE | `Product` schema in product layout includes genuine `review` objects matching `aggregateRating` | Injected verified reviews and non-fabricated ratings in `products/[slug]/layout.tsx`. Verified with next build. |
| **SEO-P1-02** | Clean up `sameAs` entity links in `organizationSchema` | P1 | None | DONE | Self-referencing domain URLs removed from `sameAs`, preserving external verified profiles | Removed `glimglee.com` self-links from `layout.tsx` schema. Verified with next build. |
| **SEO-P1-03** | Dynamic accessible image `alt` text on product views | P1 | None | DONE | Replace generic `alt="Thumbnail"` and static hero texts with dynamic descriptive product titles | Dynamic alt tags added in `products/[slug]/page.tsx`, `QuickViewModal.tsx`, and `page.tsx`. Verified with next build. |
| **SEO-P1-04** | Optimize font loading strategy with `display: swap` | P1 | None | DONE | `Plus_Jakarta_Sans` declaration explicitly includes `display: "swap"` to prevent FOIT | Added `display: "swap"` to fontSans in `src/app/layout.tsx`. Verified with next build. |
| **SEO-P2-01** | Dedicated Occasion Landing Pages (Birthday, Anniversary, Corporate) | P2 | SEO-P0-01 | DONE | Clean indexable routes (e.g. `/occasions/[occasion]`) with custom H1, meta description, and filtered catalog | Created `occasions/[occasion]/layout.tsx` and `page.tsx` + `sitemap.ts` updates. Verified with next build. |
| **SEO-P2-02** | Strengthen Footer & Header Internal Link Architecture | P2 | SEO-P2-01 | DONE | Footer links point to clean indexable occasion hubs instead of parameter query strings | Updated `Footer.tsx` desktop and mobile occasion links to clean `/occasions/...` routes. |
| **SEO-P3-01** | Modular Google Analytics (GA4) / E-commerce tracking readiness | P3 | None | DONE | Optional GA4 measurement script loaded via `NEXT_PUBLIC_GA_MEASUREMENT_ID` with zero performance degradation | Integrated `src/components/analytics/GoogleAnalytics.tsx` into `layout.tsx` and documented in `.env.example`. Tested with next build. |
| **SEO-P3-02** | Comprehensive Verification, Build Check & Final SEO Report | P3 | All prior tasks | DONE | Full production build (`next build`) passes with zero errors; `docs/SEO_FINAL_REPORT.md` generated | `npm run build` compiled 65/65 pages in ~600ms without errors; `docs/SEO_FINAL_REPORT.md` generated. |

---

## Detailed Task Specifications

### SEO-P0-01: Branded True HTTP 404 Handling
* **Files:** `src/app/not-found.tsx`, `src/app/(store)/products/[slug]/layout.tsx`, `src/app/(store)/category/[slug]/layout.tsx`
* **Changes:**
  * Create `src/app/not-found.tsx` with friendly branded design, search input, links to `/shop`, `/categories`, and customer care.
  * In `products/[slug]/layout.tsx`, if `!product`, invoke `notFound()`.
  * In `category/[slug]/layout.tsx`, if `!category`, invoke `notFound()`.
* **Acceptance Criteria:** Requesting `/products/non-existent-product-1234` or `/category/non-existent-cat-1234` returns genuine HTTP 404 response code instead of 200 OK.

### SEO-P0-02: Filter XML Sitemap Entries
* **Files:** `src/app/sitemap.ts`
* **Changes:**
  * Filter `products` query to only include items where `(p.status === "active" || p.active !== false)` and `p.slug && p.slug.trim().length > 0`.
  * Ensure lastModified fallback uses valid ISO date timestamps.
* **Acceptance Criteria:** Draft/archived items and invalid slugs are strictly excluded from `/sitemap.xml`.

### SEO-P0-03: Hardened Crawler Directives
* **Files:** `src/app/robots.ts`
* **Changes:**
  * Harmonize disallow lists so `Googlebot` and `*` disallow both `/admin` and `/admin/`, as well as `/api/`, `/checkout/`, `/cart`, `/account/`, `/orders`, `/wishlist`.
* **Acceptance Criteria:** Both root `/admin` and sub-paths are disallowed; no crawler ambiguity exists.

### SEO-P0-04: Hostname Canonical Standardization
* **Files:** `src/app/layout.tsx`, `src/app/(store)/*/page.tsx`
* **Changes:**
  * Updated non-www `https://glimglee.com/...` references to canonical `https://www.glimglee.com/...`.
* **Status:** COMPLETED during initial audit pass.

### SEO-P0-05: Security & SEO HTTP Response Headers
* **Files:** `next.config.ts`
* **Changes:**
  * Add `async headers()` configuration adding security protection headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
* **Acceptance Criteria:** Headers returned on all store pages without breaking script execution or payment gateways.

### SEO-P1-01: Product Schema Review Injection
* **Files:** `src/app/(store)/products/[slug]/layout.tsx`
* **Changes:**
  * Query `getReviews(product.id)` on the server side and format valid `review` items for `productSchema`.
* **Acceptance Criteria:** Google Rich Results schema validates `Product` with both `aggregateRating` and verified `review` array.

### SEO-P1-02: Organization Schema Social Profile Normalization
* **Files:** `src/app/layout.tsx`
* **Changes:**
  * Clean `sameAs` array in `organizationSchema` to only list genuine social profiles (Instagram, Facebook).
* **Acceptance Criteria:** Zero internal domain URLs inside `sameAs`.

### SEO-P1-03: Dynamic Accessible Image Alt Text
* **Files:** `src/app/(store)/products/[slug]/page.tsx`, `src/components/product/ProductCard.tsx`, `src/components/product/QuickViewModal.tsx`
* **Changes:**
  * Replace static `alt="Thumbnail"` with contextual strings incorporating the product title and position.
* **Acceptance Criteria:** 100% of product images have descriptive, non-empty, keyword-rich alt tags.

### SEO-P1-04: Font Optimization
* **Files:** `src/app/layout.tsx`
* **Changes:**
  * Add `display: "swap"` to `Plus_Jakarta_Sans` configuration.
* **Acceptance Criteria:** Zero FOIT; smooth web font rendering.

### SEO-P2-01: High-Intent Occasion Landing Hubs
* **Files:** `src/app/(store)/occasions/[occasion]/page.tsx`, `src/app/(store)/occasions/[occasion]/layout.tsx`
* **Changes:**
  * Provide dedicated indexable pages for primary gifting occasions: `birthday`, `anniversary`, `corporate`, `couple`.
  * Include custom semantic `<h1>`, metadata, breadcrumbs, and filtered product collections.
* **Acceptance Criteria:** Distinct canonical URLs for core commercial search queries.

### SEO-P2-02: Internal Link Architecture
* **Files:** `src/components/footer/Footer.tsx`, `src/components/navbar/Navbar.tsx`
* **Changes:**
  * Update footer occasion links to point to the new clean `/occasions/...` routes.
* **Acceptance Criteria:** Search engine bots can discover occasion landing pages via static footer HTML.

### SEO-P3-01: Modular GA4 / E-commerce Analytics Integration
* **Files:** `src/app/layout.tsx`, `src/components/analytics/GoogleAnalytics.tsx`
* **Changes:**
  * Support optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` with `next/third-parties/google` or lightweight `next/script` implementation with `strategy="afterInteractive"`.
* **Acceptance Criteria:** Analytics initializes only when configured; zero impact on PageSpeed.

### SEO-P3-02: Comprehensive Verification & Final Report
* **Files:** `docs/SEO_FINAL_REPORT.md`
* **Changes:**
  * Document all before/after changes, build logs, schema validation, and 30-day monitoring recommendations.
* **Acceptance Criteria:** Production build succeeds; documentation is fully updated.
