# Payments

Open Store uses Stripe for card payments and webhook-driven order updates.

## Required Stripe Values

Set these in env or in admin settings:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Notes:
- the publishable key is used in the browser
- the secret key is used server-side to create payment intents
- the webhook secret is required in production for payment confirmation events
- admin settings can override the stored Stripe keys used at runtime

## Checkout Flow

1. Customer reviews cart
2. Checkout page requests a Payment Intent from `/api/create-payment-intent`
3. Stripe Elements collects card details
4. Payment is confirmed client-side
5. Order status is updated through the webhook flow

## Webhook Events

Configure the Stripe webhook endpoint:

```text
https://your-store.vercel.app/api/stripe/webhook
```

Subscribe to:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

## Local Development

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Production Notes

- After adding or changing `STRIPE_WEBHOOK_SECRET` in Vercel, redeploy once.
- If payments can start but order states do not update, the webhook is usually missing or mis-signed.
- If you switch from test keys to live keys, update both the API keys and the webhook endpoint in live mode.

## Test Cards

| Card | Number | Behavior |
| --- | --- | --- |
| Visa success | `4242 4242 4242 4242` | Succeeds |
| Generic decline | `4000 0000 0000 0002` | Declines |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |
| Insufficient funds | `4000 0000 0000 9995` | Fails |
