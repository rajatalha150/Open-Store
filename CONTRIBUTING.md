# Contributing to Open Store

Created and maintained by **Muhammad Talha Raza**.

Thank you for your interest in contributing to Open Store. This guide covers the current development workflow and the conventions used in this repo.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/open-store.git
   cd open-store
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.local.example` to `.env.local` and fill in the required values. See [Environment Variables](docs/environment-variables.md).
5. Set up the database. See [Database Setup](docs/database-setup.md).
6. Start the dev server:

   ```bash
   npm run dev
   ```

7. Complete `/setup` to create the first admin account.

## Development Workflow

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes.
3. Test locally.
4. Commit with a clear message:

   ```bash
   git commit -m "Add: brief description of the change"
   ```

5. Push to your fork and open a pull request.

## Commit Message Format

Use a prefix to indicate the type of change:

- `Add:` - New feature or functionality
- `Fix:` - Bug fix
- `Update:` - Enhancement to existing feature
- `Refactor:` - Code restructuring without behavior change
- `Docs:` - Documentation only
- `Style:` - Formatting or CSS-only change
- `Test:` - Adding or updating tests

## Project Structure

```text
open-store/
|- app/                  # Next.js App Router pages and API routes
|  |- admin/             # Admin dashboard pages
|  |- api/               # REST API endpoints
|  `- ...                # Public-facing pages
|- components/           # React components
|  `- ui/                # UI base components
|- contexts/             # React context providers
|- lib/                  # Server-side utilities
|  |- db.ts              # Database query functions
|  |- db-pool.ts         # Neon Postgres connection
|  |- auth.ts            # NextAuth configuration
|  |- email.ts           # Email templates and sending
|  |- schema.sql         # CLI SQL schema reference
|  `- schema-statements.ts # Serverless setup schema statements
|- public/               # Static assets
|- scripts/              # Setup and maintenance scripts
`- docs/                 # Documentation
```

## Guidelines

### Code Style

- Use TypeScript for new files.
- Follow existing patterns in the codebase.
- Use the Neon `sql` tagged template for database queries:

  ```ts
  import { sql } from '@/lib/db-pool';

  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  ```

- Use Next.js App Router conventions for route handlers and pages.

### Database Changes

If your change requires a new table or column:

1. Update `lib/schema.sql` when the CLI migration flow needs the change.
2. Update `lib/schema-statements.ts` for the `/setup` serverless setup flow.
3. Add or update query functions in `lib/db.ts`.
4. Update any affected admin forms, storefront views, and API route validation.
5. Document the change in your pull request.

### API Routes

- All API routes go in `app/api/`.
- Use proper HTTP methods: `GET`, `POST`, `PUT`, and `DELETE`.
- Return consistent JSON responses with appropriate status codes.
- Admin routes should check access with `validateAdminAccess()` from `lib/admin-auth.ts`.
- Validate user input at the API boundary.

### Product and Review Features

- Product variants are normalized through `lib/product-variants.ts`.
- Product variant cart behavior lives in `contexts/CartContext.tsx`.
- Admin product variant editing lives in `app/admin/products/page.tsx`.
- Review storefront display lives in `components/ProductReviews.tsx`.
- Admin review management lives in `app/admin/reviews/page.tsx` and `app/api/admin/reviews/route.ts`.

### UI Components

- Use components from `components/ui/` where they fit existing patterns.
- Follow the existing Tailwind CSS conventions.
- Keep admin and storefront flows responsive.

## Reporting Issues

- Use GitHub Issues to report bugs or request features.
- Include steps to reproduce for bug reports.
- Include screenshots for UI issues when possible.

## Pull Request Checklist

Before submitting a pull request, make sure:

- [ ] Code compiles without errors with `npx tsc --noEmit`
- [ ] The app builds successfully with `npm run build`
- [ ] You tested the changed flow locally
- [ ] Database changes are reflected in the setup and migration schema paths
- [ ] New API endpoints are documented
- [ ] No secrets or credentials are committed

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
