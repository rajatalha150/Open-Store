# Customization Guide

This project supports two kinds of customization:
- runtime branding through the admin panel
- code-level UI and behavior changes in the repository

## 1. Branding Through Admin Settings

Use `Admin > Settings` for the normal storefront branding flow.

You can update:
- store name
- contact email
- phone and address
- currency and timezone
- store logo

These values appear in places such as:
- header and footer
- contact page
- metadata and browser title
- transactional emails

Notes:
- runtime settings are database-backed and should update without redeploy
- favicon and browser-tab icon changes may require a hard refresh
- if Blob is misconfigured, logo upload will fail until `BLOB_READ_WRITE_TOKEN` is fixed

## 2. Hardcoded Fallbacks

If no admin setting exists yet, the app falls back to environment variables such as:

```env
STORE_NAME="My Store"
STORE_EMAIL="hello@example.com"
STORE_PHONE=""
STORE_ADDRESS=""
STORE_CITY=""
STORE_STATE=""
STORE_ZIP=""
CURRENCY="USD"
TIMEZONE="America/New_York"
```

## 3. Header, Footer, and Layout

Primary files:
- `components/Header.tsx`
- `components/Footer.tsx`
- `app/layout.tsx`

Use these when you want code-level changes to:
- navigation
- logo placement
- footer links
- metadata defaults

## 4. Static Content Pages

These pages are easy to edit directly:
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/faq/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`

## 5. Theme and Styling

Primary styling files:
- `app/globals.css`
- `tailwind.config.js`

Use them to change:
- colors
- spacing
- typography
- utility tokens and theme extensions

## 6. Homepage Composition

The homepage is assembled from reusable storefront components. Edit `app/page.tsx` and related components to change section order, featured collections, or merchandising.

## 7. Product Merchandising

Product merchandising is mostly managed in `Admin > Products`.

You can configure:
- product image galleries
- a primary image by reordering product images
- up to 10 variants per product
- variant price adjustments
- variant-level stock
- variant image mapping from the existing product image gallery

When changing product variant behavior in code, check:
- `app/admin/products/page.tsx`
- `app/product/[id]/page.tsx`
- `contexts/CartContext.tsx`
- `lib/product-variants.ts`

Product reviews are managed in `Admin > Reviews`. Admin-created reviews are stored as approved reviews, while shopper-created reviews normally flow through moderation before they appear on the storefront.

## 8. Schema-Driven Customization

When adding new product or settings fields:
1. update `lib/schema.sql`
2. update `lib/schema-statements.ts`
3. update database access in `lib/db.ts`
4. update admin forms
5. update storefront rendering
6. run `npm run db:setup` or re-run `/setup` before an admin exists

When adding new review fields, also update:
- `app/api/reviews/route.ts`
- `app/api/admin/reviews/route.ts`
- `app/admin/reviews/page.tsx`
- `components/ProductReviews.tsx`

## 9. Image and Asset Notes

Uploads for products, categories, and branding use Vercel Blob, not a local `public/` upload flow.

Use `public/` for:
- static decorative assets
- fallback icons
- hardcoded brand images that are part of the codebase
