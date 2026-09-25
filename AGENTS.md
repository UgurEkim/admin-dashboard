<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Database backup contract

- Settings is the single location for full application-data backup and restore.
  Preserve its compact, consistent button styling; do not add backup buttons to lists.
- Whenever adding or changing persisted business data, update the database snapshot,
  backup format, import validation and transactional restoration together. Include
  related records, attachments, settings and ID sequences where applicable.
- Add or update round-trip coverage proving the new data survives export and import.
  Preserve compatibility with existing backups through defaults or explicit version
  migration. Never silently omit data or overwrite existing records on restore.
- Document any intentionally excluded internal data and restore limitations in
  docs/database.md. Do not call a partial export a full application backup.

## Deployment and authentication plan

- One Next.js app serves the public website and the private /dashboard.
- Deploy the app and PostgreSQL using Docker with runtime environment configuration.
- Implement authentication later using Authentik OpenID Connect and an independent
  local admin login. Protect dashboard routes and every private data endpoint;
  authorize admin access explicitly, not simply any authenticated SSO user.
- Keep auth secrets and local admin password hashes server-side. Authentication
  configuration in example files is reserved until implemented; never present it
  as functioning protection. Keep unauthenticated containers localhost-only.
