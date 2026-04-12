# Admin Guide

The admin area is available at `/admin` after you sign in as an admin user.

## First-Run Setup

Go to `/setup` when no admin exists.

What it does:
1. checks whether setup is still available
2. runs schema migrations if needed
3. creates the first admin account
4. attempts automatic sign-in

If `SETUP_SECRET` is configured, the page requires it before setup can continue.

Once an admin already exists, `/setup` is no longer available for creating another first admin.

## Core Admin Areas

### Dashboard
- revenue and order summaries
- customer counts
- recent orders
- trend charts

### Products
Use `Admin > Products` to:
- create products
- upload product images to Vercel Blob
- add up to 10 variant option rows, such as `Size: Large` or `Color: Black`
- manage stock, price, tags, and featured status

Variant rows can include a price adjustment and option-level stock. If a product has variants, customers choose the required option values on the product detail page before adding it to the cart.

### Categories
Use `Admin > Categories` to:
- create category names and slugs
- upload category images
- assign display icons

### Orders
Use `Admin > Orders` to:
- review incoming orders
- change order status
- save tracking numbers
- inspect payment state

### Users
Use `Admin > Users` to:
- search and paginate users
- inspect account status and joined date
- activate, deactivate, lock, or unlock accounts
- switch account types where appropriate

### Reviews, Coupons, Contacts
Dedicated admin sections exist for:
- review moderation
- coupon management
- contact-message handling

## Store Settings

`Admin > Settings` manages:
- store name
- store email
- address and contact details
- logo
- currency and timezone
- Stripe keys
- feature toggles

Current runtime behavior:
- these values are stored in the database
- storefront reads are uncached
- after save, the site should reflect changes without redeploy
- favicon updates may still need a hard refresh because browsers cache icons

## Email Settings

`Admin > Settings > Email` manages:
- SMTP host, port, secure mode, username, and password
- sender email and display name
- test emails
- email templates and related settings

## Shipping, Health, and Backups

Other admin pages include:
- shipping settings and carrier management
- inventory alerts
- security logs
- system health
- database backup and restore

## Password Rules

The `/setup` page enforces a strong admin password:
- at least 12 characters
- uppercase letter
- lowercase letter
- number
- special character

## Operational Notes

- Stripe webhook delivery is required for full payment-status automation.
- Blob must be connected correctly for product, category, and logo uploads.
- Admin settings override env defaults for most storefront branding values.
