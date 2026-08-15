# Next.js frontend

This is the replacement Paperless UI. It talks to the existing Django REST API and does not reimplement OCR, search, permissions, or consumption.

The Angular application in `../src-ui` remains the production UI until this client reaches feature parity. See `FEATURE_PARITY.md`.

## Stack

- Next.js App Router
- Tailwind CSS + shadcn/ui
- TanStack Query
- Zod

## Develop

The Django backend should already be running, usually at `http://localhost:8000`.

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Sign in with a Paperless username and password. The token is stored in an httpOnly cookie and proxied to Django; it is not written to `localStorage`.

## Scripts

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Generate API types

When the backend is running with schema access:

```bash
pnpm generate:api-types
```

Generated files in `types/generated/` must not be edited by hand.

## Environment

| Variable        | Default                 | Purpose                                     |
| --------------- | ----------------------- | ------------------------------------------- |
| `PAPERLESS_URL` | `http://localhost:8000` | Django origin used by the server-side proxy |
