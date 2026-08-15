# Contributing

Bug fixes and improvements are welcome.

## Branches

- `dev` is the default working branch.
- Feature work should land on short-lived branches and open pull requests against `dev`.
- `main` reflects the latest release.

## Python

Supported Python versions are 3.11 through 3.14. Format Python with [ruff](https://docs.astral.sh/ruff/formatter/).

Run backend tests from `src/`:

```bash
pytest
```

## Frontends

The Angular UI lives in `src-ui/`. The Next.js UI lives in `frontend-next/`.

Do not remove or substantially change `src-ui/` until the Next.js client has feature parity.

From `frontend-next/`:

```bash
pnpm install
pnpm test
pnpm lint
pnpm typecheck
```

## Pull requests

- Target `dev` for code changes.
- Include tests for new behavior.
- Do not rewrite Django business logic into the frontend.
- Disclose AI-assisted work in the PR description.

## Translations

Frontend and Django translation files live in-repo. There is no external translation service configured for this repository.
