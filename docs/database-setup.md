# Database Setup

Open Store uses [Neon](https://neon.tech) - a serverless Postgres provider. Neon offers a generous free tier and works seamlessly with Vercel deployments.

## Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Click **New Project**
3. Choose a name (e.g., `open-store`) and region closest to your users
4. Once created, copy the **Connection string** from the dashboard

The connection string looks like:
```
postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

5. Add it to your `.env.local`:

```env
DATABASE_URL="postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Initialize the Schema

Run the setup script to create all tables:

```bash
npm run db:setup
```

This executes `lib/schema.sql` which creates the following tables:

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Customer and admin accounts |
| `products` | Product catalog |
| `categories` | Product categories |
| `orders` | Customer orders |
| `order_items` | Items within each order |
| `reviews` | Product reviews and ratings |
| `coupons` | Discount codes |
| `settings` | Store configuration (key-value) |

### Customer Tables

| Table | Purpose |
|-------|---------|
| `wishlist` | Saved products per user |
| `recently_viewed` | Browsing history per user |
| `newsletter_subscribers` | Email subscriptions |
| `contact_messages` | Customer inquiries |

### Shipping Tables

| Table | Purpose |
|-------|---------|
| `carriers` | Shipping carriers (UPS, FedEx, etc.) |
| `shipping_carriers` | Carrier API configurations |
| `shipping_methods` | Available shipping methods |
| `shipping_rates` | Rate calculations by zone/weight |
| `shipping_zones` | Geographic shipping zones |
| `shipping_tracking` | Tracking events per order |

### Subscription Tables

| Table | Purpose |
|-------|---------|
| `subscription_plans` | Available subscription plans |
| `subscriptions` | Active user subscriptions |
| `subscription_orders` | Recurring order records |

### Security & Logging

| Table | Purpose |
|-------|---------|
| `security_logs` | Admin actions and security events |
| `user_activity_logs` | User activity tracking |
| `support_chats` | Customer support conversations |
| `chat_messages` | Individual chat messages |

## Key Schema Details

### Users Table
- Supports email/password authentication
- Fields for email verification tokens and password reset tokens
- Account locking after failed login attempts
- `account_type` field distinguishes `admin` from `customer`

### Products Table
- Supports `original_price` for showing discounts
- `tags` stored as PostgreSQL array (`TEXT[]`)
- `featured` flag for homepage display
- `stock_quantity` with `in_stock` boolean

### Orders Table
- `shipping_address` and `billing_address` stored as JSONB
- Separate `payment_status` from order `status`
- Stripe integration fields (`payment_intent_id`, `stripe_payment_id`)
- Timestamp tracking (`shipped_at`, `delivered_at`)

### Settings Table
- Key-value store with JSONB values
- Used for store config, Stripe keys, email settings, feature flags
- Single source of truth for all configurable settings

## Backup & Restore

### Create a Backup
From the admin panel: **Admin > Backup** or via the API:
```bash
curl -X POST http://localhost:3000/api/admin/backup \
  -H "Cookie: your-session-cookie"
```

### Using npm scripts
```bash
npm run backup    # Create backup
npm run restore   # Restore from backup
```

## Connecting from External Tools

You can connect to your Neon database using any Postgres client:

- **psql**: `psql "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"`
- **pgAdmin**: Add a new server with the Neon connection details
- **DBeaver**: Create a new PostgreSQL connection

## Migrations

The schema is managed via `lib/schema.sql`. All tables use `CREATE TABLE IF NOT EXISTS` so the setup script is safe to run multiple times.

To add a new table:
1. Add the `CREATE TABLE IF NOT EXISTS` statement to `lib/schema.sql`
2. Run `npm run db:setup`
3. Add the corresponding query functions to `lib/db.ts`
