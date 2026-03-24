# Stripe Production Setup Guide

This guide explains how to set up Stripe for real payments on your live store.

It is written for non-technical users. Follow the steps in order.

## What You Are Doing

You need to collect 3 Stripe values and add them to your live website:

1. A public Stripe key
2. A private Stripe key
3. A webhook secret

These allow your store to:

- Show the Stripe payment form
- Create real charges
- Confirm when a payment succeeds or fails

## Before You Start

Make sure:

- You can log in to your Stripe account
- You can open your website hosting dashboard, such as Vercel
- Your live website domain is already working

## The 3 Stripe Values You Need

You are looking for these exact values:

1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   This starts with `pk_live_`

2. `STRIPE_SECRET_KEY`
   This starts with `sk_live_`

3. `STRIPE_WEBHOOK_SECRET`
   This starts with `whsec_`

Important:

- Use `live` keys, not `test` keys
- Do not share the secret key publicly
- The webhook secret is separate from the Stripe secret key

## Part 1: Get Your Live Stripe Keys

### Step 1: Open Stripe Dashboard

Log in to Stripe:

`https://dashboard.stripe.com`

### Step 2: Turn On Live Mode

In Stripe, make sure you are viewing live data, not test data.

Look for the `Test mode` switch and make sure it is off.

You should now be working with real live payments.

### Step 3: Open API Keys

In Stripe, go to:

`Developers` -> `API keys`

### Step 4: Copy the Publishable Key

Find the live publishable key.

It will begin with:

`pk_live_`

Copy it and save it somewhere safe for now.

Label it:

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 5: Copy the Secret Key

Find the live secret key.

It will begin with:

`sk_live_`

You may need to click to reveal it.

Copy it and save it somewhere safe.

Label it:

`STRIPE_SECRET_KEY`

Important:

- This key is private
- Do not email it around casually
- Do not paste it into website text fields unless you trust that screen

## Part 2: Create the Webhook in Stripe

Stripe also needs a webhook so your store knows when a payment succeeds or fails.

### Step 6: Open Webhooks

In Stripe, go to:

`Developers` -> `Webhooks`

### Step 7: Create a Webhook Endpoint

Create a new webhook endpoint.

Use this URL:

`https://your-domain.com/api/stripe/webhook`

Replace `your-domain.com` with your real website domain.

Example:

`https://daynightsupplies.com/api/stripe/webhook`

### Step 8: Choose the Events

When Stripe asks which events to send, choose these:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

These are the important ones this store uses.

### Step 9: Copy the Signing Secret

After the webhook is created, open it and reveal the signing secret.

It will begin with:

`whsec_`

Copy it and save it.

Label it:

`STRIPE_WEBHOOK_SECRET`

## Part 3: Add the Values to Your Live Website

Now you will add the 3 Stripe values to your live hosting environment.

If your site is hosted on Vercel:

### Step 10: Open Your Vercel Project

Log in to Vercel and open the correct project for your store.

### Step 11: Open Environment Variables

Go to:

`Project Settings` -> `Environment Variables`

### Step 12: Add These 3 Variables

Add these exactly:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Make sure:

- The names are typed exactly
- There are no extra spaces
- You paste the full values

### Step 13: Save and Redeploy

After saving the environment variables, redeploy the site.

If Vercel asks whether to redeploy, choose yes.

If it does not redeploy automatically, start a new deployment manually.

## Part 4: Test It

After deployment, test the live payment setup carefully.

### Step 14: Check the Store

Open the live website and go through checkout like a normal customer.

### Step 15: Make a Small Real Payment

Use a real card and make a very small live purchase.

This is the safest way to confirm everything is working.

After payment:

- The payment should complete successfully
- The order should update correctly
- Stripe should show the payment in live mode

### Step 16: Check Stripe Webhook Deliveries

Back in Stripe, open the webhook you created and check recent deliveries.

You want to see successful deliveries, usually with a `200` response.

## What To Do If Something Goes Wrong

### Problem: The payment form does not load

Usually this means the publishable key is missing or wrong.

Check:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- It starts with `pk_live_`
- The site was redeployed after adding it

### Problem: The website cannot create a payment

Usually this means the secret key is missing or wrong.

Check:

- `STRIPE_SECRET_KEY`
- It starts with `sk_live_`
- You copied the live key, not a test key

### Problem: Payments go through but the order does not update

Usually this means the webhook is missing or the webhook secret is wrong.

Check:

- The webhook URL is correct
- The webhook secret starts with `whsec_`
- The secret in your hosting dashboard matches the secret shown in Stripe

### Problem: Someone used test keys by mistake

Live payments will not work correctly if test keys were used.

Check every Stripe value again:

- `pk_live_...`
- `sk_live_...`
- live webhook secret for the live endpoint

## Simple Checklist

Before you finish, confirm all 6 items below:

- Stripe is in live mode
- You copied a `pk_live_` key
- You copied an `sk_live_` key
- You created a webhook for `/api/stripe/webhook`
- You copied the `whsec_` signing secret
- You added all 3 values to your live hosting environment and redeployed

## Exact Values This Store Uses

This store expects these environment variable names:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Official Stripe References

If you need Stripe's official instructions:

- Stripe API keys: https://docs.stripe.com/keys
- Stripe webhooks: https://docs.stripe.com/webhooks

