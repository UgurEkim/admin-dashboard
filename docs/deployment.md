# Docker and authentication roadmap

## Run locally in Docker

Copy `.env.docker.example` to `.env.docker`, then run:

```sh
docker compose --env-file .env.docker --profile app up --build -d
```

Open http://localhost:8080. The database becomes healthy first, Prisma applies
committed migrations in a separate one-shot job, and then the app starts.
The app image runs as a non-root user and contains the Next.js standalone output.
The separate migration image includes the Prisma CLI. Secrets are passed at runtime,
never copied into the image. `/api/health` checks database connectivity without
returning credentials or record counts.

The existing PostgreSQL volume is reused for this project; taking down containers
does not remove it. Never use `down -v` when keeping workshop data. The existing
`npm run dev` plus database-only Compose workflow remains available.

Active variables:

| Variable                      | Purpose                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `DOCKER_DATABASE_URL`         | Connection string used by app and migration containers; Compose database hostname is `db`.                         |
| `POSTGRES_PASSWORD`           | Initial password when creating a new PostgreSQL volume. Changing it does not rotate an existing database password. |
| `APP_PORT`                    | Loopback host port, default 8080.                                                                                  |
| `APP_URL`                     | Local application URL; must match the selected port. Currently checked by the startup gate.                        |
| `ALLOW_UNAUTHENTICATED_LOCAL` | Explicit opt-in for the current unauthenticated local evaluation. Defaults to false.                               |
| `DATABASE_URL`                | Direct connection used outside Docker (for example local Next.js development).                                     |

The container's internal HOSTNAME is 0.0.0.0 so Docker can reach it; Compose only
publishes it on the host's 127.0.0.1. Do not expose this port through a reverse
proxy yet. The startup gate checks configuration, not the identity of a caller.

## Authentication to implement later

The intended public URL is https://www.uekim.nl, with the admin UI at /dashboard.
Use Authentik as an OpenID Connect provider and also offer an independent local
admin login for recovery. Planned server-only variables are documented, commented
out, in `.env.docker.example`: AUTH_SECRET, OIDC_ISSUER, OIDC_CLIENT_ID,
OIDC_CLIENT_SECRET, OIDC_ADMIN_GROUP, LOCAL_ADMIN_ENABLED, LOCAL_ADMIN_EMAIL and
LOCAL_ADMIN_PASSWORD_HASH. They are not currently read and do not create accounts.

Implementation must include session management, explicit admin authorization,
dashboard and private-API protection, secure password verification, login rate
limiting and recovery/account-bootstrap rules. Do not grant admin to every SSO
user or automatically link local accounts solely by matching an email address.
Register the exact callback URL in Authentik once the authentication library is
chosen; no callback endpoint exists yet.

Public deployment, reverse-proxy trust and removal of the local-only gate come
after authentication is implemented and tested. Auth secrets should not be part
of downloadable application backups; document and test that boundary when user
accounts are introduced.
