# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Happy Together — KWCA Supply Manager (`artifacts/happy-together`)

- **Type**: React + Vite (frontend-only, mock data)
- **Preview path**: `/`
- **Tech**: React, Tailwind CSS, Wouter routing, React Query
- **Data**: All data is local state (mock) — no backend or DB used yet
- **Pages**:
  - `/` — Main public page: KWCA header, drop info card, item list with claim modal
  - `/admin` — Admin login (ID: `happy123` / PW: `together123`), drop info editor, batch item entry table with Tab navigation, publish button
- **Design**: Warm cream/terracotta color palette, custom KWCA flower logo, polished shadcn-style components
- **State**: Shared via React Context (`AppContext`) — claim, publish, and drop info updates all work live

## Future Integration Notes (from PRD)

- Replace mock data with Google Sheets API via backend routes
- Add real PIN verification / cell group lookup via backend
- Connect to Vercel for production deployment
