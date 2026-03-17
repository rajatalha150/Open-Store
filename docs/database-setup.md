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

Why both exist:
- `lib/schema.sql` is easier to read and maintain
- `lib/schema-statements.ts` is used by serverless setup flows where filesystem access is not the right runtime assumption

If you add or change tables, update both files.

## Current Core Tables

| Table | Purpose |
| --- | --- |
| `users` | Customers and admins |
| `products` | Catalog items |
| `categories` | Catalog categories |
| `orders` | Order headers |
| `order_items` | Order line items |
| `reviews` | Product reviews |
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
