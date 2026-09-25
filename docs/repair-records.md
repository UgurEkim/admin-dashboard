# Repair records

Customers own devices; work orders describe a specific repair of a device.
Create customers from Customers, add a device from a customer profile, and start
a work order from a device profile. All three pages also have independent create
actions, searchable lists, edit modals, and guarded delete actions.

Business records use PostgreSQL through Prisma and a server-only API. Client
repositories contain HTTP calls; schemas and relationship checks run on the
server. Customers, devices, orders, catalog/prices, photos and the default phone
code are stored in SQL. Theme preferences and live hardware sessions remain local.
There are no mock customer/device/order seeds. Catalog defaults are initialized
once and never restored after deletion.

Settings contains an explicit JSON backup import. The importer preserves IDs,
relationships, history, intake details and sequence high-water marks. Imports are
atomic, reject non-empty business databases and avoid duplicate retries. Existing
browser storage is never erased or used as a fallback. Settings is the central location for full application-data backups. Downloads
include catalog, settings, sequences and device PINs. They are unencrypted JSON
files, not PostgreSQL schema/SQL dumps. See database.md for setup and migration.

Shared accessible dialogs and searchable pickers live in components/records.
Repository validation enforces ownership, duplicate serial checks and deletion
dependencies. Status changes append timestamped history. Existing records without
history show their last known status; earlier transitions are not invented.

Current scope: contact/address details, device identification, service type,
reported issue, condition/accessories, diagnosis/work performed, target date,
estimated/final cost in euros, payment state, collection date.
Costs are administrative notes, not invoices or tax accounting.

## Intake

Creating a work order means the customer has already agreed to the service.
New orders default to Waiting and can progress to Repairing, Testing and
Completed without a separate approval step or signature. Estimate and scope
changes do not reset the order status.

The intake modal records condition, accessories, up to four compressed photos
and an optional device access code. Photos are resized to 960 pixels and limited
to 800 KB of encoded data per order in the database.
Access codes are masked in the interface, stored without encryption, excluded
from search, included in full backups, and should be cleared when returning the device.

Previously saved approval states are imported as Waiting. Retired approval fields
and approval-only history entries are omitted during migration;
customer, device, repair and intake details remain intact.

## Saved product preferences

- List design: compact bordered header, clickable summary filters, aligned
  search/filter/sort toolbar, visible result range, clear empty-state action,
  and consistent icon-labelled Open/Edit controls. SummaryFilter is reusable.
- Work-order status colors come from lib/work-order-status.ts: Waiting amber,
  Repairing blue, Testing purple, Completed green. Use StatusBadge for status
  labels. Reserve checkmark/loading space in status buttons to avoid movement.
- Work orders support newest, oldest, recently updated and due-date sorting;
  undated orders appear last when sorting by due date. Status summary counts
  cover all orders; the result range reflects the combined search and filter.
- Every record deletion must require an explicit confirmation modal identifying
  the record and consequences. Cancel/close must leave records unchanged;
  failures must remain visible. Never delete directly from a single action.
- Work-order deletion belongs inside the edit modal, away from quick status
  controls. Cancelling its confirmation preserves unsaved edits.
- Customer and device lists expose Open/Edit only. Delete belongs on their
  detail pages and opens a confirmation naming the record; linked records
  continue to block deletion.
- Compact vertical modal forms; never inline create/edit forms.
- Searchable themed customer/device pickers, with bounded popup height.
- Phone presets currently +31, +32, +49; Netherlands is the default.
- Future Settings should allow adding/removing calling codes (e.g. France +33)
  as well as choosing the default. The default setting already exists.
- Keep database access behind server repositories; UI components use the HTTP
  repository interface and never receive database credentials.

## Research

RepairDesk intake guidance informed customer/device relationships, serial number,
condition, supplied accessories, target dates and cost fields:
https://help.repairdesk.co/portal/en/kb/articles/how-can-i-add-repair-device-details-on-new-ticket

## Checks

Run npm run test:records for schemas, import normalization and catalog rules.
Run npm run test:sql against an isolated PostgreSQL test database for persistence,
relationships, duplicate serials, deletion guards, history, concurrent IDs and
transaction rollback. See database.md for the test database setup.
