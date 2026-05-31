# Agent Runtime Platform

AI Runtime Security Platform for autonomous AI systems.

We help organizations monitor, control, and secure AI agents before risky actions execute.

## Category positioning

- Primary label: **AI Runtime Security Platform**
- Secondary descriptor: **Runtime Security Infrastructure for Autonomous AI Systems**

## Scope and audience for this repository

This repository is currently the first source of truth for:
1. Technical positioning in the README
2. Canonical thesis and evidence mapping docs
3. Messaging consistency inputs for investor, security-buyer, and developer narratives

## Canonical thesis package

- Thesis: `/tmp/workspace/MARKASCHARAN/agent-runtime-platform/docs/thesis/company-product-thesis.md`
- Claim truth matrix: `/tmp/workspace/MARKASCHARAN/agent-runtime-platform/docs/thesis/claim-truth-matrix.md`
- Productization + execution plan: `/tmp/workspace/MARKASCHARAN/agent-runtime-platform/docs/thesis/execution-plan.md`
- GTM assets + governance: `/tmp/workspace/MARKASCHARAN/agent-runtime-platform/docs/thesis/gtm-assets.md`

## Current capabilities vs roadmap

### Current capabilities (implemented in this repo)
- Next.js marketing/dashboard frontend foundation in `apps/dashboard`
- Runtime security thesis messaging, category framing, pillar framing, and persona framing in landing-page UI
- Shared UI component package and monorepo tooling for lint/typecheck/build

### Partial prototype
- Realtime Security Dashboard framing is present as UI content, but not connected to runtime backend services in this repository snapshot

### Roadmap (not yet implemented in this repository)
- Runtime Policy Engine backend enforcement
- MCP Security Engine trust and schema verification pipeline
- Memory Integrity Engine mutation ledger and rollback controls
- Attack Replay Engine with stored runtime-event trace reconstruction
- SDK instrumentation packages (TypeScript + Python)
- Backend services for ingestion/risk/policy/sessions/replay

See the truth matrix for evidence and status details.

## Monorepo layout

- `apps/dashboard` — Next.js app for product messaging/front-end experience
- `packages/ui` — shared UI components
- `packages/eslint-config` — workspace ESLint configuration
- `packages/typescript-config` — workspace TypeScript configuration

## Development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm check-types
pnpm build
```

> Note: In restricted/offline environments, `pnpm build` may fail when fetching Google Fonts used by Next.js layout.
