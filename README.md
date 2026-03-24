# Open Store

Open Store is a Next.js 14 ecommerce template built for Vercel. It uses Neon Postgres for data, Vercel Blob for image uploads, NextAuth for authentication, and Stripe for payments.

## Current Architecture

- Next.js 14 App Router
- Neon Postgres for all application data
- Vercel Blob for product, category, and branding images
- NextAuth.js for customer and admin sessions
- Stripe for checkout and webhooks
- SMTP via Nodemailer for transactional email

## What Works Today

### Storefront
- Product catalog, search, categories, filters, and recommendations
- Cart, checkout, coupon validation, and order tracking
- Customer accounts, wishlist, profile, and order history
- Static content pages that read live store settings

### Admin
- First-run setup at `/setup`
- Product, category, order, user, review, coupon, and contact management
- Store settings, email settings, shipping, analytics, backups, and health pages
- Image upload through Vercel Blob

## Quick Start

### Prerequisites
- Node.js 18+
- A Neon database
- A Stripe account
- An SMTP provider
- A Vercel account if you plan to deploy

### 1. Install

```bash
git clone https://github.com/your-username/open-store.git
cd open-store
npm install
```

### 2. Configure local environment

```bash
cp .env.local.example .env.local
```

Set at least:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

If you want local image uploads against Vercel Blob, also set:
- `BLOB_READ_WRITE_TOKEN`

### 3. Start the app

```bash
npm run dev
```

### 4. Run first setup

Open `http://localhost:3000/setup` and create the first admin account.

The setup flow:
- checks whether an admin already exists
- runs idempotent schema migrations
- creates the first admin user
- signs you in automatically when possible

## Deployment

The recommended production stack is:
- Vercel
- Neon Postgres
- Vercel Blob
- Stripe

High-level deploy order:
1. Create the Neon database
2. Add Vercel environment variables
3. Connect a Vercel Blob store
4. Deploy to Vercel
5. Visit `/setup` once to create the admin account
6. Configure the Stripe webhook

See `docs/deployment.md` for the full dashboard and CLI flow.

## Settings Behavior

Store settings saved in `Admin > Settings` are database-backed. After the current code is deployed:
- store name, email, logo, and similar settings should update without a redeploy
- already-open tabs refresh on focus or after the next request
- favicon changes may still require a hard refresh because browsers cache icons aggressively

A redeploy is only required when you change:
- code
- Vercel environment variables
- Blob / Neon wiring
- anything else that affects the build or runtime environment

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server locally |
| `npm run db:setup` | Run schema migration from the CLI |
| `npm run admin:init` | Create an admin user from the CLI |
| `npm run admin:ensure` | Ensure an admin exists |
| `npm run backup` | Export database backup |
| `npm run restore` | Restore database backup |

## Documentation

- `docs/getting-started.md` - local setup
- `docs/deployment.md` - Vercel, GitHub, Neon, and Blob deployment
- `docs/environment-variables.md` - canonical env var list
- `docs/database-setup.md` - Neon and schema setup
- `docs/admin-guide.md` - admin panel workflows
- `docs/stripe-production-setup.md` - Stripe production setup for live payments
- `docs/email-setup.md` - SMTP configuration
- `docs/customization.md` - branding and storefront customization
- `docs/api-reference.md` - API endpoints

## Project Structure

```text
open-store/
|- app/                  # App Router pages and API routes
|- components/           # Reusable UI
|- contexts/             # React providers
|- docs/                 # Project documentation
|- lib/                  # Database, auth, setup, email, stripe, utilities
|- public/               # Static assets
|- scripts/              # Setup and maintenance scripts
|- .env.local.example    # Local env template
`- .env.production.example
```
