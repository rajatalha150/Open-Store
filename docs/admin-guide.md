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

Product images are the source for variant image mapping. Upload or paste product images first, then use each variant row's image dropdown to point a variant at one of those existing images.

Variant rows can include:
- option name, such as `Size` or `Color`
- option value, such as `Large` or `Black`
- price adjustment
- option-level stock
- mapped image from the product image gallery

If a product has variants, customers must choose the required option values on the product detail page before adding it to the cart. When a selected variant has a mapped image, the storefront gallery switches to that image and the cart line uses it.

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

### Reviews
Use `Admin > Reviews` to:
- view reviews across all products
- add a review for a selected product
- enter first name, optional last name, rating, optional title, and review text
- set a review date in the past or use the current date default
- approve, reject, or move reviews back to pending
- delete any review, whether it was created by an admin or a shopper

Admin-created reviews are saved as approved reviews by default, so they appear on the matching product page like normal approved customer reviews. Review status changes and deletions recalculate the product's approved-review rating and review count.

### Coupons and Contacts
Dedicated admin sections exist for:
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
