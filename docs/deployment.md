# Deployment Guide

Open Store is optimized for deployment on [Vercel](https://vercel.com) with a serverless [Neon](https://neon.tech) Postgres database and [Vercel Blob](https://vercel.com/storage/blob) for image uploads. The steps below cover both dashboard-only and terminal/CLI workflows after you push to GitHub.

## Deploy to Vercel

### Prerequisites
- GitHub account (for repo + Vercel auto-deploys)
- Vercel account (free)
- Neon database (free)
- Stripe account (for payments; you can skip until ready)

### Step 0: Prepare local env (optional sanity check)

```bash
cp .env.local.example .env.local
npm install
npm run dev  # quick smoke test at http://localhost:3000
```

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/open-store.git
git push -u origin main
```

### Step 2: Create Neon database (one-time)
1. In the Neon dashboard, create a new project and database.
2. Copy the connection string with `?sslmode=require`, e.g.  
   `postgresql://user:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require`
3. Keep it ready as `DATABASE_URL`.

### Step 3A: Dashboard workflow (fastest)
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. When prompted for Environment Variables, paste the essentials (see table below).
3. In the project, open **Storage → Blob** and click **Create Store**. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`.
4. Click **Deploy**. After build, visit `https://your-store.vercel.app/setup` to create the first admin (tables migrate automatically).

### Step 3B: Terminal/CLI workflow (stays in git + CLI)
```bash
# Link local folder to the Vercel project (creates if missing)
npx vercel link

# Add env vars from your terminal (repeat for each)
echo "postgresql://...sslmode=require" | npx vercel env add DATABASE_URL production
echo "https://your-store.vercel.app"    | npx vercel env add NEXTAUTH_URL production
openssl rand -base64 32 | npx vercel env add NEXTAUTH_SECRET production

# Pull envs locally for reference (optional)
npx vercel env pull .env.production.local

# Trigger a production deploy
npx vercel deploy --prod
```
After the deploy finishes, open the production URL and go to `/setup` to create the admin user.

### Environment Variables (minimum to launch)

| Variable | Purpose / Example |
|----------|-------------------|
| `DATABASE_URL` | Neon connection string with `sslmode=require` |
| `NEXTAUTH_URL` | `https://your-store.vercel.app` (or your custom domain) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | Auto-created when you add Vercel Blob storage |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe (can use test key while testing) |
| `STRIPE_SECRET_KEY` | From Stripe (test or live) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint (see below) |
| `SMTP_*` | SMTP host/port/user/pass for transactional email |

See [Environment Variables](environment-variables.md) for optional toggles.

### Step 4: Create Admin Account (web)
Visit `https://your-store.vercel.app/setup` after the first deploy. It runs the migrations and creates the first admin. Add `SETUP_SECRET` before visiting if you want to lock the page.

> **Optional:** For extra security, set a `SETUP_SECRET` environment variable in Vercel before visiting `/setup`. The page will require this secret before allowing setup. See [Environment Variables](environment-variables.md).

### Step 5: Configure Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-store.vercel.app/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret
5. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### Step 6: Connect GitHub auto-deploys (if you used CLI first)
If you deployed via `npx vercel link`, open the Vercel project settings → **Git** and connect the same GitHub repo. Every push to `main` will auto-deploy and use existing env vars + Blob + Neon.

## Custom Domain

1. In Vercel project settings, go to **Domains**
2. Add your domain (e.g., `mystore.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

## Production Checklist

- [ ] All environment variables are set
- [ ] Admin account created via `/setup` (database tables are created automatically)
- [ ] `SETUP_SECRET` set if you want to protect the setup page (optional)
- [ ] Stripe is in **live mode** (not test mode)
- [ ] Stripe webhook is configured with production URL
- [ ] SMTP email is configured and tested
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Vercel Blob storage is connected
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active (automatic with Vercel)

## Monitoring

### Vercel Dashboard
- **Deployments** - Build logs and deployment history
- **Analytics** - Traffic and performance metrics
- **Logs** - Runtime logs and errors

### Built-in Health Checks
- `/api/health` - Basic health check (database connectivity)
- `/admin/system-health` - Detailed system metrics (admin only)

## Updating

To deploy updates:

```bash
git add .
git commit -m "Update description"
git push
```

Vercel automatically deploys on every push to the main branch.

## Rollback

If a deployment causes issues:
1. Go to Vercel dashboard > **Deployments**
2. Find the last working deployment
3. Click the **...** menu > **Promote to Production**
