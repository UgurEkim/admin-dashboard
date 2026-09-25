import { snapshotSchema } from "./schemas";

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
