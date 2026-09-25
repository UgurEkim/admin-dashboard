import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { orderInput } = require("../data/schemas.ts");
const { normalizeImport } = require("../data/legacy-import.ts");
const base = { customerId: "c", deviceId: "d", issue: "HDMI" };
test("full backup retains all application fields and can be imported", () => {
  const { createBackup } = require("../data/backup.ts");
  const now = new Date("2026-09-25T12:34:56.000Z");
  const snapshot = normalizeImport({
    customers: [],
    devices: [],
    catalog: [
      {
        id: "service-backup",
        kind: "service",
        name: "HDMI replacement",
        price: "85.00",
        description: "Replace a damaged HDMI port",
      },
    ],
    orders: [
      {
        ...base,
        id: "WO-1",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        accessCode: "1234",
        intakePhotos: [
          {
            id: "p",
            name: "photo",
            dataUrl: "data:image/jpeg;base64,/9j/2Q==",
          },
        ],
        history: [{ status: "Waiting", at: now.toISOString() }],
      },
    ],
    settings: { defaultPhoneCountryCode: "+32" },
    sequences: { WO: 99 },
  });
  const backup = createBackup(snapshot, now);
  assert.deepEqual(normalizeImport(JSON.parse(backup.content)), snapshot);
  assert.ok(!backup.filename.includes(":"));
  assert.equal(JSON.parse(backup.content).orders[0].accessCode, "1234");
});
test("intake fields and zero cost are retained", () => {
  const order = orderInput.parse({
    ...base,
    estimate: "0",
    accessCode: "1234",
    intakeCondition: "Scratched",
    accessories: "Cable",
  });
  assert.equal(order.accessCode, "1234");
  assert.equal(order.estimate, "0");
  assert.equal(order.accessories, "Cable");
});
test("unsafe and excessive photos are rejected", () => {
  assert.throws(() =>
    orderInput.parse({
      ...base,
      intakePhotos: [
        { id: "x", name: "x", dataUrl: "data:image/svg+xml,<svg/>" },
      ],
    }),
  );
  assert.throws(() =>
    orderInput.parse({
      ...base,
      intakePhotos: Array(5).fill({
        id: "x",
        name: "x",
        dataUrl: "data:image/jpeg;base64,/9j/2Q==",
      }),
    }),
  );
});
test("old statuses normalize and approval metadata is discarded", () => {
  const date = new Date().toISOString();
  const data = normalizeImport({
    customers: [],
    devices: [],
    catalog: [],
    orders: [
      {
        ...base,
        id: "WO-1",
        createdAt: date,
        updatedAt: date,
        status: "Awaiting approval",
        approvalSignature: "Old",
      },
    ],
  });
  assert.equal(data.orders[0].status, "Waiting");
  assert.equal(data.orders[0].approvalSignature, undefined);
});
test("unsupported backups fail instead of silently clearing records", () => {
  assert.throws(() =>
    normalizeImport({
      version: 2,
      customers: [],
      devices: [],
      orders: [],
      catalog: [],
    }),
  );
  assert.throws(() => normalizeImport({ customers: [] }));
});
