# Context for AI Agents

This file contains instructions and context for AI agents working on this codebase.

## Project Overview
This is a Next.js application using Payload CMS for the backend and e-commerce functionality.
- **Framework**: Next.js (App Router)
- **CMS**: Payload CMS
- **Database**: PostgreSQL (Neon)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Build & Run
- **Install Dependencies**: `pnpm install` (Use `pnpm`, do not use `npm` or `yarn`)
- **Development Server**: `pnpm dev` (Starts on http://localhost:3000)
- **Production Build**: `pnpm build`
- **Start Production**: `pnpm start`

## Testing
- **Frameworks**: Vitest (Integration/Unit), Playwright (E2E)
- **Run Integration Tests**: `pnpm test:int`
- **Run E2E Tests**: `pnpm test:e2e`
- **Run All Tests**: `pnpm test`
- **Note**: Ensure the database is running before running tests.

## Code Style & Linting
- **Linting**: `pnpm lint`
- **Formatting**: Prettier is used. `pnpm lint:fix` helps fix issues.
- **Conventions**:
  - Use TypeScript for all new files (`.ts` or `.tsx`).
  - Prefer functional React components with Hooks.
  - Use Tailwind CSS for styling.
  - Follow the folder structure in `src/` (e.g., `collections` for Payload collections, `components` for UI).

## Database & Migrations
- **ORM/Adapter**: Payload uses `@payloadcms/db-postgres`.
- **Migrations**: Managed by Payload.
  - Create migration: `pnpm payload migrate:create`
  - Run migrations: `pnpm payload migrate`

## Important Paths
- `src/payload.config.ts`: Main Payload configuration.
- `src/collections/`: Database schema definitions (Collections).
- `src/app/`: Next.js App Router pages.
- `src/components/`: React components.
