import { defaultCatalog } from "./catalog";
import { snapshotSchema } from "./schemas";

function readCollection(key: string) {
  const raw = window.localStorage.getItem(key);
  if (!raw) return undefined;
  const value = JSON.parse(raw);
  if (Array.isArray(value)) return value;
  if (value?.version === 1 && Array.isArray(value.data)) return value.data;
  throw new Error(
    "Unrecognized browser storage format. Nothing has been changed.",
  );
}
export function normalizeImport(value: unknown) {
  if (!value || typeof value !== "object")
    throw new Error("Choose a repair-records backup.");
  const raw = value as Record<string, unknown>;
  if (raw.version !== undefined && raw.version !== 1)
    throw new Error("Unsupported backup version.");
  const retired = (status: unknown) =>
    status === "Awaiting approval" || status === "Approval declined";
  return snapshotSchema.parse({
    ...raw,
    orders: Array.isArray(raw.orders)
      ? raw.orders.map((o) => ({
          ...o,
          status: retired(o.status) ? "Waiting" : o.status,
          paymentStatus: o.paymentStatus || "Unpaid",
          history: Array.isArray(o.history)
            ? o.history.filter((h: { status: unknown }) => !retired(h.status))
            : [],
        }))
      : raw.orders,
  });
}
export function readBrowserImport() {
  const customers = readCollection("repair-admin.customers");
  const devices = readCollection("repair-admin.devices");
  const orders = readCollection("repair-admin.work-orders");
  const catalog = readCollection("repair-admin.catalog");
  if (!customers && !devices && !orders && !catalog) return null;
  return normalizeImport({
    customers: customers ?? [],
    devices: devices ?? [],
    orders: orders ?? [],
    catalog: catalog ?? defaultCatalog,
    settings: {
      defaultPhoneCountryCode:
        window.localStorage.getItem(
          "repair-admin.settings.default-phone-country-code",
        ) || "+31",
    },
    sequences: Object.fromEntries(
      ["CUS", "DEV", "WO"].map((prefix) => [
        prefix,
        Number(
          window.localStorage.getItem("repair-admin.sequence." + prefix),
        ) || 0,
      ]),
    ),
  });
}
