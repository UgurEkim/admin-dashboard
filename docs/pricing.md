# Pricing

Manage services at `/dashboard/pricing` from the Pricing sidebar item. Categories,
brands and models remain under Settings. Existing service records are reused;
there is no separate copy of the price list or schema migration.

Services support category/brand/model scope, a public description and a EUR price.
An empty price means Quote required; zero is a valid fixed price. Work orders copy
the selected service price, so later pricing changes do not alter existing estimates.
Removal requires confirmation and leaves saved work-order details intact.

The customer page `/pricing` and read-only JSON feed `/api/pricing` read the same
PostgreSQL catalog. All saved services are currently public: there is no draft or
visibility setting. Only the explicitly projected service fields are returned;
customer records, work orders and device PINs are never queried by this endpoint.
The feed allows cross-origin GET requests for a separate frontend. Connect the
future website to the deployed API URL, not the dashboard's private records API.
The app still runs on localhost; this change does not publish it on the internet.

Services remain part of the central full backup and restore under `catalog`.
