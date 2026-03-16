# Package Manager Instructions

Always use pnpm instead of npm for all package management tasks:

- Use `pnpm install` instead of `npm install`
- Use `pnpm add <package>` instead of `npm install <package>`
- Use `pnpm add -D <package>` instead of `npm install --save-dev <package>`
- Use `pnpm remove <package>` instead of `npm uninstall <package>`
- Use `pnpm run <script>` instead of `npm run <script>`
- Use `pnpm <command>` for any other npm commands
- Use `pnpm dlx <command>` instead of `npx <command>`
- Use `pnpm create <template>` instead of `npm create <template>`

## Project-Specific Scripts

When running scripts from package.json, always use:

- `pnpm dev` for development server
- `pnpm build` for production build
- `pnpm run test` for running tests
- `pnpm lint` for linting
- `pnpm typecheck` for type checking
- `pnpm format` for code formatting

## Database Commands

For database-related tasks:

- `pnpm db.generate` to generate database migrations
- `pnpm db.local.migrate` to apply local migrations
- `pnpm db.prod.migrate` to apply production migrations

## Use pnpm

Never use npm, yarn, or any other package manager in this project. All package operations should be performed with pnpm.

## Tech Stack

This project uses TanStack Start. The root route is at `src/route/__root.tsx`.

Here's the tech stack:

- framework: TanStack Start (`@tanstack/start`) with `react`
- router: TanStack Router (`@tanstack/router`)
- ui: `shadcn/ui`
- css: `tailwindcss` (v4)

# Tests

We use `vitest` for the tests.

All tests are in `__test__/`.

# Validating your code

- NEVER run the dev server (e.g.: `pnpm dev`)!
- always ensure no formatting/linting issues exist in your code
  - this command automatically fixes these issues where possible: `pnpm check --fix`
- NEVER deploy anything (e.g. with `pnpm preview.deploy`, or `pnpm run deploy`)

# Coding style

- Prefer functions over arrow functions for React components and everything else
- Prefer `type`-s over `interface`-s

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Using React hooks for live queries and data fetching (useLiveQuery, useLiveSuspenseQuery, useLiveInfiniteQuery)"
    load: "node_modules/@tanstack/react-db/skills/react-db/SKILL.md"
  - task: "Setting up or modifying TanStack DB collections, adapters, and sync config"
    load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/db-core/SKILL.md"
  - task: "Setting up collections with createCollection, adapter selection, or schema config"
    load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/db-core/collection-setup/SKILL.md"
  - task: "Building live queries with the query builder (from, where, join, select, orderBy, limit)"
    load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/db-core/live-queries/SKILL.md"
  - task: "Optimistic mutations, inserts, updates, deletes, transactions, and paced mutations"
    load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/db-core/mutations-optimistic/SKILL.md"
  - task: "Integrating TanStack DB with TanStack Start (SSR, route preloading, collection lifecycle)"
    load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/meta-framework/SKILL.md"
<!-- intent-skills:end -->
