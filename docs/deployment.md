# Deployment Guide

Open Store is designed for:
- Vercel for hosting
- Neon Postgres for the database
- Vercel Blob for image uploads
- Stripe for payments

This guide covers both GitHub + dashboard deployment and terminal-first deployment.

## Recommended Order

1. Push the repo to GitHub
2. Create the Neon database
3. Create or link the Vercel project
4. Add environment variables
5. Connect a Vercel Blob store
6. Deploy
7. Open `/setup` and create the first admin
8. Configure the Stripe webhook

## Required Production Inputs

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `BLOB_READ_WRITE_TOKEN`
- SMTP credentials

`STRIPE_WEBHOOK_SECRET` is required once the webhook endpoint is created.

## A. Dashboard Workflow

### 1. Push to GitHub

Push the project to a GitHub repository that Vercel can access.

### 2. Create the Neon database

In the Neon dashboard:
1. Create a project
2. Copy the pooled connection string
3. Keep the `?sslmode=require` suffix

### 3. Import into Vercel

In Vercel:
1. Create a new project from the GitHub repository
2. Add the required environment variables
3. Set `NEXTAUTH_URL` to the final production URL or custom domain

### 4. Connect Vercel Blob

In the Vercel project:
1. Go to `Storage -> Blob`
2. Create or connect a Blob store
3. Use the default prefix `BLOB`
4. Make it available to the environments you need

Important:
- if the project already has an old `BLOB_READ_WRITE_TOKEN`, remove it first
- then connect the Blob store so Vercel can recreate the correct token

### 5. Deploy

Deploy the project. Once the site is live, visit:

```text
https://your-store.vercel.app/setup
```

Create the first admin account there.

## B. Terminal-First Workflow

### 1. Log in and link the project

```bash
npx vercel login
npx vercel link
```

### 2. Add environment variables

Examples:

```bash
echo "postgresql://...sslmode=require" | npx vercel env add DATABASE_URL production
echo "https://your-store.vercel.app" | npx vercel env add NEXTAUTH_URL production
openssl rand -base64 32 | npx vercel env add NEXTAUTH_SECRET production
echo "pk_test_..." | npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
echo "sk_test_..." | npx vercel env add STRIPE_SECRET_KEY production
```

Optional setup protection:

```bash
openssl rand -base64 32 | npx vercel env add SETUP_SECRET production
```

### 3. Connect Blob

Either use the Vercel dashboard or the Vercel storage flow. Ensure the final project environment variable is exactly:

```text
BLOB_READ_WRITE_TOKEN
```

### 4. Deploy

```bash
npx vercel deploy --prod
```

### 5. Run first setup

Open the production URL and complete `/setup`.

## Stripe Webhook

After the site is live:
1. In Stripe, add endpoint `https://your-store.vercel.app/api/stripe/webhook`
2. Subscribe to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
3. Copy the signing secret
4. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`
5. Redeploy once

## GitHub Auto-Deploys

After the first setup, keep the Vercel project linked to GitHub. Every push to `main` will deploy automatically.

## Runtime Settings vs Redeploys

After this codebase is deployed, these admin changes should apply without redeploy:
- store name
- store email
- store logo
- public contact details
- Stripe publishable key saved in admin settings

A redeploy is still required when you change:
- application code
- Vercel environment variables
- Neon or Blob project wiring
- domains or other project-level infrastructure

## Production Checklist

- [ ] Neon database created
- [ ] `DATABASE_URL` added to Vercel
- [ ] `NEXTAUTH_URL` matches production URL
- [ ] `NEXTAUTH_SECRET` set
- [ ] Blob store connected and `BLOB_READ_WRITE_TOKEN` refreshed
- [ ] SMTP configured
- [ ] `/setup` completed
- [ ] Stripe webhook configured
- [ ] GitHub auto-deploy connected
