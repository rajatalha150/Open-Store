# API Reference

All API routes live under `/api` and return JSON.

## Public Endpoints

### Catalog and storefront

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/products` | Product list, including product images and variant data |
| GET | `/api/products/[id]` | Product details, including image gallery and variants |
| GET | `/api/categories` | Category list |
| GET | `/api/search` | Product search |
| GET | `/api/recommendations` | Related products |
| GET | `/api/compare` | Compare products |
| GET | `/api/settings` | Public store settings |

### Orders and checkout

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/track` | Track by order number and email |
| POST | `/api/create-payment-intent` | Create Stripe Payment Intent |
| POST | `/api/stripe/webhook` | Stripe webhook receiver |

### Public forms and utilities

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/contact` | Contact form submission |
| POST | `/api/newsletter` | Newsletter signup |
| GET | `/api/health` | Basic app health check |
| GET | `/api/reviews?productId=123` | Approved reviews for one product |
| GET | `/api/reviews?orderId=123` | Reviews connected to one order |
| POST | `/api/reviews` | Submit product review; shopper reviews default to pending and admin-session reviews default to approved |
| POST | `/api/coupons/validate` | Validate coupon |

Example body for `POST /api/reviews`:

```json
{
  "productId": 123,
  "rating": 5,
  "title": "Great quality",
  "comment": "The product arrived quickly and worked as expected."
}
```

## Setup Endpoints

These are intended for first-run initialization.

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/setup/status` | Returns whether setup is still needed. Accepts `?secret=` when `SETUP_SECRET` is configured. |
| POST | `/api/setup` | Runs migrations and creates the first admin |

Example body for `POST /api/setup`:

```json
{
  "email": "admin@example.com",
  "password": "StrongP@ssw0rd!",
  "confirmPassword": "StrongP@ssw0rd!",
  "firstName": "Admin",
  "lastName": "User",
  "setupSecret": "optional"
}
```

Password requirements for `/setup`:
- 12 or more characters
- uppercase
- lowercase
- number
- special character

## Authenticated User Endpoints

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/user/profile` | Current user profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/user/change-password` | Change password |
| GET | `/api/user/orders` | Order history |
| GET | `/api/wishlist` | Wishlist |
| POST | `/api/wishlist` | Add to wishlist |
| DELETE | `/api/wishlist` | Remove from wishlist |
| GET | `/api/recently-viewed` | Recently viewed products |
| POST | `/api/recently-viewed` | Record product view |
| GET | `/api/subscriptions` | Current subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/plans` | List plans |
| GET | `/api/subscriptions/plans/[id]` | Plan details |

## Auth Routes

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/forgot-password` | Start password reset |
| POST | `/api/auth/reset-password` | Complete password reset |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification |

NextAuth also serves `/api/auth/[...nextauth]`.

## Admin Endpoints

All admin endpoints require an authenticated admin session.

### Catalog and uploads

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET / POST | `/api/admin/products` | Product admin API, including product images and up to 10 variants |
| GET / POST / PUT / DELETE | `/api/admin/categories` | Category admin API |
| POST | `/api/upload` | Upload image to Vercel Blob |

### Orders, users, reviews, contacts

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/admin/orders` | Admin order list |
| PUT | `/api/orders/[id]/status` | Update order status |
| GET | `/api/admin/users` | Paginated user list |
| GET / PUT | `/api/admin/users/[id]` | User details and update |
| GET | `/api/admin/users/stats` | User stats |
| GET / POST / PUT / DELETE | `/api/admin/reviews` | List, create, moderate, and delete product reviews |
| GET | `/api/admin/contacts` | Contact messages |

Example body for `POST /api/admin/reviews`:

```json
{
  "productId": 123,
  "firstName": "Jane",
  "lastName": "Customer",
  "rating": 5,
  "reviewTitle": "Excellent",
  "reviewText": "Exactly what I needed.",
  "reviewDate": "2026-04-12"
}
```

Notes:
- `reviewDate` must be today or a past date in `YYYY-MM-DD` format.
- Admin-created reviews are saved as `approved`.
- `PUT /api/admin/reviews` accepts `{ "id": 1, "status": "approved" }`, where status is `pending`, `approved`, or `rejected`.
- `DELETE /api/admin/reviews?id=1` removes a review and recalculates the product's approved-review rating and count.

### Settings and email

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET / PUT | `/api/admin/settings` | General store settings |
| GET / PUT | `/api/admin/email-settings` | SMTP and email settings |
| POST | `/api/admin/email-settings/test` | Send test email |
| POST | `/api/admin/email-settings/test-connection` | Test SMTP connection |
| POST | `/api/admin/email-test` | Send admin test email |

### System and operations

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/admin/health` | Admin health check |
| GET | `/api/admin/system/health` | Detailed health metrics |
| GET | `/api/admin/security/logs` | Security log feed |
| POST | `/api/admin/backup` | Create backup |
| POST | `/api/admin/restore` | Restore backup |
| POST | `/api/admin/init` | Admin initialization helper |
| GET | `/api/admin/integration-status` | Integration status |

### Shipping and inventory

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/inventory` | Inventory list |
| GET | `/api/admin/inventory/alerts` | Inventory alerts |
| GET / PUT | `/api/admin/inventory/settings` | Inventory settings |
| GET | `/api/shipping/carriers` | Public carrier list |
| GET / POST | `/api/admin/carriers` | Admin carrier API |
| PUT / DELETE | `/api/admin/carriers/[id]` | Update or delete carrier |
| POST | `/api/shipping/rates` | Shipping rates |
| GET | `/api/shipping/estimate` | Delivery estimate |
| GET | `/api/shipping/tracking/[trackingNumber]` | Tracking events |
