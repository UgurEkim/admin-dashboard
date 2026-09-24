import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const customers = require("../data/repositories/customers.ts");
const devices = require("../data/repositories/devices.ts");
const orders = require("../data/repositories/work-orders.ts");
let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    dispatchEvent() {},
  };
});
const contact = {
  name: "Test customer",
  email: "test@example.com",
  phone: "",
  street: "Test street",
  houseNumber: "12",
  postalCode: "1234 AB",
  city: "Test city",
};
async function setup() {
  const customer = await customers.create(contact);
  const device = await devices.create({
    customerId: customer.id,
    name: "PS5",
    category: "Console",
    model: "CFI-1216A",
    serialNumber: "TEST-1",
  });
  const order = await orders.create({
    customerId: customer.id,
    deviceId: device.id,
    issue: "HDMI port",
    status: "Waiting",
    diagnosis: "",
    description: "",
    technicianNotes: "",
  });
  return { customer, device, order };
}
test("customer address and edits persist through repository reads", async () => {
  const c = await customers.create(contact);
  assert.equal((await customers.getById(c.id)).street, "Test street");
  await customers.update(c.id, { city: "Updated city" });
  assert.equal((await customers.getById(c.id)).city, "Updated city");
});
test("linked records load and status transitions retain history", async () => {
  const { customer, device, order } = await setup();
  await orders.update(order.id, {
    status: "Repairing",
    diagnosis: "Damaged port",
    estimate: "85",
  });
  const stored = await orders.getById(order.id);
  assert.deepEqual(
    stored.history.map((h) => h.status),
    ["Waiting", "Repairing"],
  );
  assert.equal(stored.diagnosis, "Damaged port");
  assert.equal((await devices.getByCustomerId(customer.id))[0].id, device.id);
});
test("wrong owner, duplicate serial and deleting linked records are rejected", async () => {
  const { customer, device, order } = await setup();
  const other = await customers.create({ ...contact, name: "Other" });
  await assert.rejects(
    orders.update(order.id, { customerId: other.id }),
    /belonging/,
  );
  await assert.rejects(
    devices.update(device.id, { customerId: other.id }),
    /history/,
  );
  await assert.rejects(
    devices.create({ ...device, serialNumber: "test-1" }),
    /serial/,
  );
  await assert.rejects(customers.remove(customer.id), /linked/);
  await assert.rejects(devices.remove(device.id), /linked/);
  await orders.remove(order.id);
  await devices.remove(device.id);
  await customers.remove(customer.id);
  assert.equal(await customers.getById(customer.id), undefined);
});
test("IDs are never reused after deleting the last record", async () => {
  const first = await customers.create(contact);
  await customers.remove(first.id);
  const second = await customers.create(contact);
  assert.notEqual(first.id, second.id);
});
test("legacy stored arrays survive without a storage-version marker", async () => {
  storage.set(
    "repair-admin.customers",
    JSON.stringify([{ ...contact, id: "CUS-00001", createdAt: "2026-01-01" }]),
  );
  assert.equal((await customers.getAll()).length, 1);
  assert.equal((await customers.create(contact)).id, "CUS-00002");
});
test("bad storage and write errors do not silently replace records", async () => {
  storage.set("repair-admin.customers", "{broken");
  await assert.rejects(customers.create(contact), /could not be read/);
  assert.equal(storage.get("repair-admin.customers"), "{broken");
  storage.clear();
  window.localStorage.setItem = () => {
    throw new Error("Storage full");
  };
  await assert.rejects(customers.create(contact), /Storage full/);
});
