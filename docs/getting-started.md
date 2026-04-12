# Getting Started

This guide covers the current local-development flow.

## Prerequisites

- Node.js 18+
- npm
- Git
- Neon account
- Stripe account
- SMTP provider

## 1. Clone and install

```bash
git clone https://github.com/your-username/open-store.git
cd open-store
npm install
```

## 2. Create a Neon database

Create a project in Neon and copy the pooled connection string with `sslmode=require`.

Example:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## 3. Create `.env.local`

```bash
cp .env.local.example .env.local
```

Minimum local values:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-openssl-output"
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Optional for local image uploads:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

## 4. Start the dev server

```bash
npm run dev
```

## 5. Complete first-run setup

Open `http://localhost:3000/setup`.

The setup page will:
1. check whether an admin already exists
2. run schema migrations if needed
3. create the first admin account
4. try to sign you in automatically

If you set `SETUP_SECRET` locally, the setup page will require it before continuing.

## 6. Sign in to admin

Primary admin pages:
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/reviews`
- `/admin/settings`

Early admin setup usually includes:
- creating categories
- creating products and product image galleries
- adding product variants when needed
- configuring settings, email, and shipping
- adding or moderating product reviews

## Optional CLI alternatives

You can still use the CLI if needed:

```bash
npm run db:setup
npm run admin:init
```

Use the web setup by default. It matches the production flow and exercises the actual `/setup` logic.

## Optional: sample data

```bash
npx ts-node scripts/seed-data.ts
```

## Troubleshooting

### Database connection errors
- Verify `DATABASE_URL`
- Keep `sslmode=require`
- Confirm the Neon database is reachable

### `/setup` says an admin already exists
- That deployment or database is already initialized
- Sign in at `/auth/signin`

### Image uploads fail locally
- `BLOB_READ_WRITE_TOKEN` is missing or stale
- Reconnect the Vercel Blob store and refresh the token if needed

### Settings save but do not show up
- With current code, runtime store settings are uncached
- Hard refresh if you are checking favicon or browser-tab icon changes
