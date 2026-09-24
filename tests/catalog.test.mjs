import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const catalog = require("../data/repositories/catalog.ts");
let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.window = { localStorage: {
    getItem: k => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v),
  }, dispatchEvent() {} };
});
test("catalog CRUD persists changes without restoring removed defaults", () => {
  catalog.save({ id: "brand-test", kind: "brand", name: "Test brand" });
  catalog.save({ id: "brand-test", kind: "brand", name: "Renamed brand" });
  assert.equal(catalog.getAll().find(i => i.id === "brand-test").name, "Renamed brand");
  catalog.remove("brand-test");
  assert.ok(!catalog.getAll().some(i => i.id === "brand-test"));
  catalog.remove("service-0");
  assert.ok(!catalog.getAll().some(i => i.id === "service-0"));
});
test("model relations and dependent deletion are validated", () => {
  assert.throws(() => catalog.remove("brand-0"), /linked/);
  assert.throws(() => catalog.save({ id: "bad", kind: "model", name: "Invalid", brandId: "missing", categoryId: "category-0" }), /existing/);
  assert.throws(() => catalog.save({ id: "bad", kind: "model", name: "Invalid" }), /Choose/);
});
test("prices support scope, quote and zero; public export excludes private data", () => {
  catalog.save({ id: "test-price", kind: "service", name: "Port repair", modelId: "model-1", price: "85.50", description: "HDMI replacement" });
  const exported = catalog.publicPriceList();
  const item = exported.services.find(i => i.id === "test-price");
  assert.equal(item.price, 85.5);
  assert.equal(item.model, "PS5");
  assert.equal(exported.services[0].price, null);
  assert.deepEqual(Object.keys(exported), ["version", "currency", "services"]);
  catalog.save({ id: "test-price", kind: "service", name: "Port repair", price: "0" });
  assert.equal(catalog.publicPriceList().services.find(i => i.id === "test-price").price, 0);
});
test("invalid prices, duplicates and mismatched model scope are rejected", () => {
  for (const price of ["-2", "abc", "3.456"])
    assert.throws(() => catalog.save({ id: "bad", kind: "service", name: "Bad", price }), /valid price/);
  assert.throws(() => catalog.save({ id: "bad", kind: "brand", name: "Sony" }), /already exists/);
  assert.throws(() => catalog.save({ id: "bad", kind: "service", name: "Bad", modelId: "model-1", brandId: "brand-1" }), /does not match/);
});
