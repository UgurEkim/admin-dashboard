import { RecordError } from "./record-error";
import { createHash } from "node:crypto";
import { db } from "./db";
import type { Prisma } from "../generated/prisma/client";
import { defaultCatalog } from "../data/catalog";
import {
  customerInput,
  deviceInput,
  orderInput,
  catalogInput,
  settingsInput,
  snapshotSchema,
} from "../data/schemas";
import { validateCatalog } from "./catalog-validation";

type Tx = Prisma.TransactionClient;
export type Collection =
  "customers" | "devices" | "orders" | "catalog" | "settings";
// Serialize workshop writes so cross-record validation and ID allocation are atomic.
async function write<T>(action: (tx: Tx) => Promise<T>) {
  return db().$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(10412026)`;
      return action(tx);
    },
    { timeout: 30_000 },
  );
}
async function initialize(tx: Tx) {
  if (await tx.setting.findUnique({ where: { key: "initialized" } })) return;
  for (const item of defaultCatalog)
    await tx.catalogItem.upsert({
      where: { id: item.id },
      create: catalogInput.parse(item),
      update: {},
    });
  await tx.setting.upsert({
    where: { key: "defaultPhoneCountryCode" },
    create: { key: "defaultPhoneCountryCode", value: "+31" },
    update: {},
  });
  await tx.setting.create({ data: { key: "initialized", value: "true" } });
}
export async function readSnapshot() {
  await write(initialize);
  return db().$transaction(
    async (tx) => {
      const [customers, devices, orders, catalog, settings, sequences] =
        await Promise.all([
          tx.customer.findMany(),
          tx.device.findMany(),
          tx.workOrder.findMany(),
          tx.catalogItem.findMany(),
          tx.setting.findMany(),
          tx.sequence.findMany(),
        ]);
      return {
        customers,
        devices: devices.map(({ serialKey: _serialKey, ...device }) => {
          void _serialKey;
          return device;
        }),
        orders,
        catalog,
        settings: {
          defaultPhoneCountryCode:
            settings.find((s) => s.key === "defaultPhoneCountryCode")?.value ??
            "+31",
        },
        sequences: Object.fromEntries(
          sequences.map((s) => [s.prefix, s.value]),
        ),
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
async function nextId(tx: Tx, prefix: string) {
  const sequence = await tx.sequence.upsert({
    where: { prefix },
    create: { prefix, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${prefix}-${String(sequence.value).padStart(5, "0")}`;
}
async function deviceRelations(tx: Tx, customerId: string, deviceId?: string) {
  if (!(await tx.customer.findUnique({ where: { id: customerId } })))
    throw new RecordError("Select an existing customer.");
  if (
    deviceId &&
    (await tx.workOrder.count({
      where: { deviceId, customerId: { not: customerId } },
    }))
  )
    throw new RecordError(
      "This device has repair history. Its customer cannot be changed.",
    );
}
async function orderRelations(tx: Tx, customerId: string, deviceId: string) {
  const device = await tx.device.findUnique({ where: { id: deviceId } });
  if (!device || device.customerId !== customerId)
    throw new RecordError("Select a device belonging to this customer.");
}
export async function saveRecord(
  collection: Collection,
  raw: unknown,
  id?: string,
) {
  return write(async (tx) => {
    await initialize(tx);
    const now = new Date().toISOString();
    const changes =
      raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    if (collection === "customers") {
      const old = id ? await tx.customer.findUnique({ where: { id } }) : null;
      if (id && !old) throw new RecordError("Customer no longer exists.");
      const data = customerInput.parse({ ...old, ...changes });
      return id
        ? tx.customer.update({ where: { id }, data })
        : tx.customer.create({
            data: { ...data, id: await nextId(tx, "CUS"), createdAt: now },
          });
    }
    if (collection === "devices") {
      const old = id ? await tx.device.findUnique({ where: { id } }) : null;
      if (id && !old) throw new RecordError("Device no longer exists.");
      const input = deviceInput.parse({ ...old, ...changes });
      await deviceRelations(tx, input.customerId, id);
      const data = {
        ...input,
        serialKey: input.serialNumber.trim().toLowerCase() || null,
      };
      if (
        data.serialKey &&
        (await tx.device.findFirst({
          where: { serialKey: data.serialKey, id: { not: id ?? "" } },
        }))
      )
        throw new RecordError(
          "A device with this serial number already exists.",
        );
      return id
        ? tx.device.update({ where: { id }, data })
        : tx.device.create({
            data: { ...data, id: await nextId(tx, "DEV"), createdAt: now },
          });
    }
    if (collection === "orders") {
      const old = id ? await tx.workOrder.findUnique({ where: { id } }) : null;
      if (id && !old) throw new RecordError("Work order no longer exists.");
      const input = orderInput.parse({ ...old, ...changes });
      await orderRelations(tx, input.customerId, input.deviceId);
      const history = Array.isArray(old?.history) ? old.history : [];
      const data = {
        ...input,
        updatedAt: now,
        history:
          !old || old.status !== input.status
            ? [...history, { status: input.status, at: now }]
            : history,
      };
      return id
        ? tx.workOrder.update({ where: { id }, data })
        : tx.workOrder.create({
            data: { ...data, id: await nextId(tx, "WO"), createdAt: now },
          });
    }
    if (collection === "catalog") {
      const data = catalogInput.parse(changes);
      validateCatalog(
        data,
        (await tx.catalogItem.findMany()).map((item) =>
          catalogInput.parse(item),
        ),
      );
      return tx.catalogItem.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    }
    const settings = settingsInput.parse(changes);
    await tx.setting.upsert({
      where: { key: "defaultPhoneCountryCode" },
      create: {
        key: "defaultPhoneCountryCode",
        value: settings.defaultPhoneCountryCode,
      },
      update: { value: settings.defaultPhoneCountryCode },
    });
    return settings;
  });
}
export async function deleteRecord(collection: Collection, id: string) {
  return write(async (tx) => {
    if (collection === "customers") {
      if (
        (await tx.device.count({ where: { customerId: id } })) ||
        (await tx.workOrder.count({ where: { customerId: id } }))
      )
        throw new RecordError(
          "Remove this customer's devices and work orders first. Their repair history is still linked.",
        );
      return (await tx.customer.deleteMany({ where: { id } })).count > 0;
    }
    if (collection === "devices") {
      if (await tx.workOrder.count({ where: { deviceId: id } }))
        throw new RecordError(
          "Remove this device's work orders first. Its repair history is still linked.",
        );
      return (await tx.device.deleteMany({ where: { id } })).count > 0;
    }
    if (collection === "orders")
      return (await tx.workOrder.deleteMany({ where: { id } })).count > 0;
    if (collection === "catalog") {
      if (
        await tx.catalogItem.count({
          where: { OR: [{ categoryId: id }, { brandId: id }, { modelId: id }] },
        })
      )
        throw new RecordError(
          "Remove or update the linked models and prices first.",
        );
      return (await tx.catalogItem.deleteMany({ where: { id } })).count > 0;
    }
    throw new RecordError("Settings cannot be deleted.");
  });
}
export async function importSnapshot(raw: unknown) {
  const snapshot = snapshotSchema.parse(raw);
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");
  return write(async (tx) => {
    if (await tx.importReceipt.findUnique({ where: { fingerprint } }))
      return { alreadyImported: true };
    if (
      (await tx.customer.count()) ||
      (await tx.device.count()) ||
      (await tx.workOrder.count())
    )
      throw new RecordError(
        "Import requires an empty database. Existing records will not be overwritten.",
      );
    const existingCatalog = await tx.catalogItem.findMany();
    const defaults = defaultCatalog.map((i) => catalogInput.parse(i));
    if (
      existingCatalog.some(
        (i) => !defaults.some((d) => JSON.stringify(d) === JSON.stringify(i)),
      )
    )
      throw new RecordError(
        "The database catalog has been edited. Import into an empty database to preserve those changes.",
      );
    for (const [label, items] of [
      ["customers", snapshot.customers],
      ["devices", snapshot.devices],
      ["orders", snapshot.orders],
      ["catalog", snapshot.catalog],
    ] as const)
      if (new Set(items.map((i) => i.id)).size !== items.length)
        throw new RecordError("Duplicate IDs in " + label + ".");
    for (const item of snapshot.catalog)
      validateCatalog(item, snapshot.catalog);
    await tx.catalogItem.deleteMany();
    await tx.catalogItem.createMany({ data: snapshot.catalog });
    await tx.customer.createMany({ data: snapshot.customers });
    for (const device of snapshot.devices) {
      await deviceRelations(tx, device.customerId);
      await tx.device.create({
        data: {
          ...device,
          serialKey: device.serialNumber.trim().toLowerCase() || null,
        },
      });
    }
    for (const order of snapshot.orders) {
      await orderRelations(tx, order.customerId, order.deviceId);
      await tx.workOrder.create({ data: order });
    }
    for (const [prefix, items] of [
      ["CUS", snapshot.customers],
      ["DEV", snapshot.devices],
      ["WO", snapshot.orders],
    ] as const) {
      const value = Math.max(
        snapshot.sequences[prefix] ?? 0,
        ...items.map((i) => Number(i.id.match(/(\d+)$/)?.[1]) || 0),
      );
      const previous = await tx.sequence.findUnique({ where: { prefix } });
      await tx.sequence.upsert({
        where: { prefix },
        create: { prefix, value },
        update: { value: Math.max(value, previous?.value ?? 0) },
      });
    }
    await tx.setting.upsert({
      where: { key: "defaultPhoneCountryCode" },
      create: {
        key: "defaultPhoneCountryCode",
        value: snapshot.settings.defaultPhoneCountryCode,
      },
      update: { value: snapshot.settings.defaultPhoneCountryCode },
    });
    await tx.setting.upsert({
      where: { key: "initialized" },
      create: { key: "initialized", value: "true" },
      update: { value: "true" },
    });
    await tx.importReceipt.create({ data: { fingerprint } });
    return { alreadyImported: false };
  });
}
