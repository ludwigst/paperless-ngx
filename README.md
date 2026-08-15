# Paperless-ngx

Paperless-ngx is a document management system that turns physical and digital documents into a searchable archive.

This repository is the canonical source for this deployment. The Django backend, document-processing pipeline, search, workers, and REST API remain the system of record. A Next.js frontend is under active development in `frontend-next/` while the existing Angular UI in `src-ui/` stays available until feature parity is reached.

## Features

- OCR and full-text search
- Tags, correspondents, document types, storage paths, and custom fields
- Saved views, bulk operations, and workflows
- User and group permissions enforced by Django
- Consumption from folders, the web UI, and email

## Getting started

The easiest way to run Paperless is Docker Compose. Compose files live in [`docker/compose`](docker/compose).

```bash
cp docker/compose/docker-compose.postgres.yml docker-compose.yml
cp docker/compose/docker-compose.env docker-compose.env
# edit docker-compose.env, then:
docker compose up -d
```

Build the application image from this repository rather than pulling an external image:

```bash
docker compose build
```

More setup detail is in [`docs/setup.md`](docs/setup.md).

## Frontends

| Path | Status |
| --- | --- |
| `src-ui/` | Existing Angular UI. Remains the production UI until the Next.js client reaches parity. |
| `frontend-next/` | Next.js / React replacement. See that directory for local development. |

## Development

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/development.md`](docs/development.md).

## Security

Paperless stores document contents in clear text. Run it on a trusted host, preferably a local server, with backups in place. Report vulnerabilities via this repository's security advisories.

## License

GNU General Public License v3. See [`LICENSE`](LICENSE).
