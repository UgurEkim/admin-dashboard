import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../server/db";
import {
  readSnapshot,
  saveRecord,
  deleteRecord,
  importSnapshot,
} from "../server/records";
import { defaultCatalog } from "../data/catalog";

// This suite only operates on an explicitly selected, disposable test database.
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test"))
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable database whose name ends in _test.",
  );
process.env.DATABASE_URL = url;
after(async () => {
  await db().$disconnect();
});
test("PostgreSQL import, CRUD, relations, history, sequences and rollback", async () => {
  assert.equal(
    (await readSnapshot()).customers.length,
    0,
    "Test database must start empty",
  );
  await db().importReceipt.deleteMany(); // Only the explicitly selected disposable test database.
  const now = new Date().toISOString();
  const input = {
    customers: [
      {
        id: "CUS-00042",
        name: "SQL Test",
        email: "test@example.invalid",
        phone: "",
        street: "Test street",
        houseNumber: "12",
        createdAt: now,
      },
    ],
    devices: [
      {
        id: "DEV-00008",
        customerId: "CUS-00042",
        name: "PS5",
        category: "Console",
        model: "CFI",
        serialNumber: "TEST-123",
        createdAt: now,
      },
    ],
    orders: [
      {
        id: "WO-00019",
        customerId: "CUS-00042",
        deviceId: "DEV-00008",
        issue: "HDMI",
        status: "Waiting",
        createdAt: now,
        updatedAt: now,
        history: [{ status: "Waiting", at: now }],
        intakePhotos: [
          {
            id: "p",
            name: "intake.jpg",
            dataUrl: "data:image/jpeg;base64,/9j/2Q==",
          },
        ],
        accessCode: "1234",
      },
    ],
    catalog: defaultCatalog,
    settings: { defaultPhoneCountryCode: "+32" },
    sequences: { CUS: 50 },
  };
  await assert.rejects(
    importSnapshot({
      ...input,
      devices: [{ ...input.devices[0], customerId: "missing" }],
    }),
  );
  assert.equal(
    (await readSnapshot()).customers.length,
    0,
    "Invalid import must roll back customers",
  );
  await importSnapshot(input);
  assert.equal((await importSnapshot(input)).alreadyImported, true);
  const migrated = await readSnapshot();
  assert.equal(migrated.customers[0].street, "Test street");
  assert.equal(migrated.settings.defaultPhoneCountryCode, "+32");
  assert.equal(migrated.orders[0].accessCode, "1234");
  const customer = await saveRecord("customers", {
    name: "Second",
    phone: "123",
  });
  assert.ok("id" in customer);
  const cid = (customer as { id: string }).id;
  assert.equal(cid, "CUS-00051");
  await assert.rejects(
    saveRecord("devices", {
      customerId: cid,
      name: "Duplicate",
      model: "CFI",
      category: "Console",
      serialNumber: " test-123 ",
    }),
    /serial number/,
  );
  await assert.rejects(
    saveRecord("orders", { customerId: cid }, "WO-00019"),
    /belonging/,
  );
  await assert.rejects(
    saveRecord("devices", { customerId: cid }, "DEV-00008"),
    /history/,
  );
  await assert.rejects(deleteRecord("customers", "CUS-00042"), /linked/);
  await assert.rejects(deleteRecord("devices", "DEV-00008"), /linked/);
  for (const status of ["Repairing", "Testing", "Completed"])
    await saveRecord("orders", { status }, "WO-00019");
  await saveRecord("orders", { estimate: "100" }, "WO-00019");
  const order = (await readSnapshot()).orders[0];
  assert.equal(order.status, "Completed");
  assert.deepEqual(
    (order.history as { status: string }[]).map((h) => h.status),
    ["Waiting", "Repairing", "Testing", "Completed"],
  );
  assert.equal((order.intakePhotos as unknown[]).length, 1);
  const created = await Promise.all([
    saveRecord("customers", { name: "A", phone: "1" }),
    saveRecord("customers", { name: "B", phone: "2" }),
  ]);
  assert.notEqual(
    (created[0] as { id: string }).id,
    (created[1] as { id: string }).id,
  );
  await assert.rejects(
    importSnapshot({
      ...input,
      customers: [{ ...input.customers[0], name: "Changed" }],
    }),
    /empty database/,
  );
  await saveRecord("catalog", {
    id: "service-test",
    kind: "service",
    name: "Test service",
    price: "0",
  });
  await assert.rejects(deleteRecord("catalog", "category-0"), /linked/);
  await deleteRecord("catalog", "service-test");
  await deleteRecord("orders", "WO-00019");
  await deleteRecord("devices", "DEV-00008");
  for (const c of (await readSnapshot()).customers)
    await deleteRecord("customers", c.id);
});
