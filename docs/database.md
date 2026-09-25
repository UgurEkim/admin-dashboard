# PostgreSQL setup and migration

The dashboard now requires DATABASE_URL; it does not fall back to browser data.
Prisma 7 is used with the PostgreSQL driver adapter. Database credentials remain
server-side. The app scripts bind to 127.0.0.1, and the API rejects cross-origin
requests. This is a local development application without user authentication;
add authentication and deployment configuration before exposing it publicly.

## Local development

1. Copy `.env.example` to `.env`. The sample credentials are for localhost only.
2. Run `npm run db:start` with Docker Desktop running. PostgreSQL uses port 5433
   and a persistent named volume. Do not remove that volume when restarting.
3. Run `npm run db:generate`, then `npm run db:migrate`.
4. Restart `npm run dev` so the server reads DATABASE_URL.
5. To restore saved data, open Settings / Database backups / Import backup,
   select your JSON backup, review the counts and confirm the import.

For an existing PostgreSQL server, set DATABASE_URL in `.env` to an empty database
you control, then run the generation/migration commands. Never put this URL in a
NEXT_PUBLIC variable. Do not paste production credentials into a commit or chat.

An import can also use the existing version-1 repair-records JSON backup. It is
limited to 32 MB, validated before insertion, and runs in a single transaction.
An already-populated business database or edited catalog blocks import. There is
no merge/overwrite mode. Repeating an identical completed import is a no-op.
Keep the original browser data and JSON export until the migrated records have
been checked. Browser data is never deleted automatically.

## Central backups

Settings / Database backups / Download full backup fetches a fresh consistent
snapshot from PostgreSQL. It downloads an import-compatible, timestamped JSON
file containing all application records, photos, history, catalog/prices,
settings, sequence counters and device PINs. No backup actions appear on lists.
The download location is controlled by the browser. Store these unencrypted
files securely. This is an application-data backup, not a pg_dump: internal
import receipts, Prisma migrations and database schema are not exported. Restore
into a migrated empty database using the JSON importer (currently 32 MB maximum).

## Data design

Customer/device/order relations have restrictive foreign keys; deletion guards
provide readable errors. Device serial keys are normalized and uniquely indexed.
Writes use a transaction-scoped PostgreSQL advisory lock so relationship checks,
ID allocation and status history are atomic for this single-workshop application.
Sequences never reuse deleted IDs and migration preserves the old high-water mark.
Intake photos and history are JSON arrays; record dates and monetary values retain
their existing ISO/decimal string representation to avoid changing display values.
Catalog labels and work-order prices remain snapshots when catalog entries change.

Client reads request a consistent snapshot. Saves notify this tab and other tabs;
returning focus refreshes data. There is no automatic cross-computer live push.

## Checks

`npm run lint`, `npm run build`, `npm run test:records`, `npm run test:tools`.

SQL integration tests require a disposable database ending in `_test`. Example:

```powershell
docker run --detach --name repair-admin-sql-test --publish 127.0.0.1:5434:5432 --env POSTGRES_USER=repair --env POSTGRES_PASSWORD=repair --env POSTGRES_DB=repair_admin_test postgres:17
$env:DATABASE_URL = 'postgresql://repair:repair@localhost:5434/repair_admin_test'
npm run db:migrate
$env:TEST_DATABASE_URL = $env:DATABASE_URL
npm run test:sql
```

Use a separate shell from the development server. The suite requires an empty
business database and only removes its own test records and test import receipts.
Afterward stop the test container. Never point this suite at the workshop database.

## Dependency audit

The installed Prisma 7 CLI dependency tree currently reports advisories in
deepmerge-ts and mysql2. Application queries use pg, not mysql2, and Prisma config
is developer-controlled. No forced downgrade or unverified major override was
applied. Recheck these advisories when upgrading Prisma; the release offered by
the CLI at implementation time was Prisma 8 release candidate, not a stable 8.
