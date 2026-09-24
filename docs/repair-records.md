# Repair records

Customers own devices; work orders describe a specific repair of a device.
Create customers from Customers, add a device from a customer profile, and start
a work order from a device profile. All three pages also have independent create
actions, searchable lists, edit modals, and guarded delete actions.

Records use the existing localStorage repository boundary. Detail pages must
load records on the client. Existing arrays and version-1 envelopes are retained.
There is no seeded data or reset-on-start behavior. JSON export downloads all three
collections; keep the file for backup or later migration. Import/restore UI and
PostgreSQL persistence are not implemented yet.

Shared accessible dialogs and searchable pickers live in components/records.
Repository validation enforces ownership, duplicate serial checks and deletion
dependencies. Status changes append timestamped history. Existing records without
history show their last known status; earlier transitions are not invented.

Current scope: contact/address details, device identification, service type,
reported issue, condition/accessories, diagnosis/work performed, target date,
estimated/final cost in euros, payment state, collection date.
Costs are administrative notes, not invoices or tax accounting.

## Saved product preferences

- Compact vertical modal forms; never inline create/edit forms.
- Searchable themed customer/device pickers, with bounded popup height.
- Phone presets currently +31, +32, +49; Netherlands is the default.
- Future Settings should allow adding/removing calling codes (e.g. France +33)
  as well as choosing the default. The default setting already exists.
- Future PostgreSQL/ORM storage should replace repositories without coupling
  page components to database queries.

## Research

RepairDesk intake guidance informed customer/device relationships, serial number,
condition, supplied accessories, target dates and cost fields:
https://help.repairdesk.co/portal/en/kb/articles/how-can-i-add-repair-device-details-on-new-ticket

## Checks

Run node --test tests/records.test.mjs for persistence, relationships, duplicate
serial numbers, deletion guards, history, ID allocation and storage failures.
