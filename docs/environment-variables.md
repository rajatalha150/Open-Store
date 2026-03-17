# Environment Variables

This file is the canonical reference for environment variables that the current codebase actually reads.

## Core Required Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXTAUTH_URL` | Yes | Base URL of the app |
| `NEXTAUTH_SECRET` | Yes | NextAuth session secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes, unless stored in admin settings | Client-side Stripe key |
| `STRIPE_SECRET_KEY` | Yes, unless stored in admin settings | Server-side Stripe key |

## File Uploads

| Variable | Required | Purpose |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Yes for uploads | Vercel Blob token for product, category, and logo uploads |

Notes:
- On Vercel, connect a Blob store with prefix `BLOB` so the variable name is `BLOB_READ_WRITE_TOKEN`.
- If uploads fail with `BlobStoreNotFoundError`, the token is usually stale or linked to a deleted Blob store.

## Stripe

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Usually yes | Browser Stripe key |
| `STRIPE_SECRET_KEY` | Usually yes | Payment Intent creation |
| `STRIPE_WEBHOOK_SECRET` | Yes in production | Verifies Stripe webhooks |

Admin settings can override the Stripe keys stored in the environment.

## Email / SMTP

| Variable | Required | Purpose |
| --- | --- | --- |
| `SMTP_HOST` | Recommended | SMTP server hostname |
| `SMTP_PORT` | Recommended | SMTP port |
| `SMTP_SECURE` | Recommended | `true` for SSL/TLS, `false` for STARTTLS/plain |
| `SMTP_USER` | Recommended | SMTP username |
| `SMTP_PASS` | Recommended | SMTP password or app password |
| `EMAIL_FROM` | Recommended | Fallback sender email |

Admin email settings override these values when saved.

## Store Defaults

These are fallback values. The admin panel settings override them at runtime.

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Default admin email used by CLI scripts |
| `STORE_NAME` | Fallback store name |
| `STORE_EMAIL` | Fallback contact email |
| `STORE_PHONE` | Fallback phone |
| `STORE_ADDRESS` | Fallback street address |
| `STORE_CITY` | Fallback city |
| `STORE_STATE` | Fallback state |
| `STORE_ZIP` | Fallback zip code |
| `CURRENCY` | Fallback currency |
| `TIMEZONE` | Fallback timezone |

## Setup Protection

| Variable | Required | Purpose |
| --- | --- | --- |
| `SETUP_SECRET` | Optional | Protects `/setup` before the first admin exists |

If set, `/setup` first requires the matching secret.

## Miscellaneous

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | No | Standard Node environment |
| `MAINTENANCE_API_KEY` | Optional | Protects the maintenance cleanup route |

## Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
- Store settings, email settings, and some Stripe settings can be managed in the admin panel and override env defaults.
- Runtime store settings are now read uncached, so admin branding changes should apply without redeploy once the code is deployed.
