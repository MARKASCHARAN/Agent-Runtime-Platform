# Contributing to Agent Runtime

First off, thank you for considering contributing to the Agent Runtime Platform! As an open-source security project, community scrutiny and contributions are what keep the platform robust.

## Code of Conduct
This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### 1. Setup Your Environment
This project is a Turborepo monorepo utilizing NestJS, Next.js, and Prisma.

```bash
# Clone the repo
git clone https://github.com/your-org/agent-runtime-platform.git
cd agent-runtime-platform

# Install dependencies via pnpm
pnpm install

# Setup Prisma Database (Local PostgreSQL required)
cd apps/api
npx prisma db push
npx prisma generate
```

### 2. Testing Requirements (Crucial)
Because this is a security and governance runtime, **all pull requests must include unit and/or integration tests**.
- **SDK Changes:** Must include Jest tests in `packages/ts-sdk/src/*.spec.ts`.
- **API/Policy Engine Changes:** Must include NestJS E2E tests validating that security policies are strictly enforced.

To run tests locally:
```bash
pnpm test
```

### 3. Pull Request Process
1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation in `DOCS.md` or `README.md`.
4. Ensure the test suite passes (`pnpm test`).
5. Open a Pull Request with a detailed description of what you changed and *why* you changed it.

## Code Style
- Use `prettier` for formatting.
- Use `eslint` for linting.
- Follow strict typing. `any` should be heavily avoided, especially in the Policy Engine.
