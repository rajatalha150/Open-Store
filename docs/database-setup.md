# Database Setup

Open Store uses Neon Postgres.

## 1. Create the database

In Neon:
1. Create a project
2. Choose a region near your users
3. Copy the pooled connection string
4. Keep `?sslmode=require`

Example:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## 2. Add the connection string

Local:

```bash
cp .env.local.example .env.local
```

Then set `DATABASE_URL`.

Production:
- add `DATABASE_URL` in Vercel project environment variables before the first deploy

## 3. Initialize the schema

### Recommended: `/setup`

Visit `/setup` and create the first admin. The app will:
- check whether the database is already initialized
- run idempotent schema migrations
- create the first admin account

This is the recommended path for Vercel deployments.

### CLI alternative

```bash
npm run db:setup
```

This runs the migration script directly.

## Schema Source of Truth

Schema statements live in:
- `lib/schema.sql`
- `lib/schema-statements.ts`

How they are used:
- `/setup` uses `lib/schema-statements.ts`, which is safe for serverless runtime setup flows where filesystem reads are not the right assumption
- CLI migration scripts read `lib/schema.sql`

If you add or change tables, update both files and keep the serverless setup path in sync.

## Current Core Tables

| Table | Purpose |
| --- | --- |
| `users` | Customers and admins |
| `products` | Catalog items, image galleries, variant JSON, rating, and review count |
| `categories` | Catalog categories |
| `orders` | Order headers |
| `order_items` | Order line items, including selected variant details |
| `reviews` | Product reviews with rating, title, text, status, customer name, and verified-purchase flag |
| `coupons` | Discount codes |
| `settings` | Store, Stripe, email, and feature settings |
| `wishlist` | Saved products |
| `newsletter_subscribers` | Email subscriptions |
| `contact_messages` | Contact form submissions |
| `security_logs` | Security and admin events |
| `shipping_*` | Shipping carriers, methods, rates, zones, and tracking |
| `subscription_*` | Subscription plans and records |
| `support_chats` / `chat_messages` | Support chat data |

## Backup and Restore

Available commands:

```bash
npm run backup
npm run restore
```

Admin UI:
- `Admin > Backup`
- `Admin > Restore`

## Troubleshooting

### `relation "settings" does not exist`
The schema has not been initialized yet. Complete `/setup` or run `npm run db:setup`.

### `relation "users" does not exist`
The first migration did not finish. Re-run `/setup` while no admin exists, or run `npm run db:setup`.

### Neon connection works locally but not on Vercel
- confirm the exact `DATABASE_URL` exists in Vercel
- confirm it includes `sslmode=require`
- redeploy after changing Vercel env vars

### Product review counts look wrong
- Review counts and average ratings are based on approved reviews only.
- Admin-created reviews are approved by default.
- Changing review status or deleting a review recalculates the product's approved-review rating and count.
