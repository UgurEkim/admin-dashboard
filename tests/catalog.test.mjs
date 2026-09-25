import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { validateCatalog } = require("../server/catalog-validation.ts");
const { catalogInput } = require("../data/schemas.ts");
const { defaultCatalog, publicPriceList } = require("../data/catalog.ts");
test("default catalog relationships are valid", () => {for (const item of defaultCatalog) validateCatalog(catalogInput.parse(item),defaultCatalog);});
test("catalog rejects duplicate scopes and mismatched models", () => {
  assert.throws(() => validateCatalog({...defaultCatalog[0],id:"duplicate"},defaultCatalog),/already exists/);
  assert.throws(() => validateCatalog({id:"bad",kind:"service",name:"Bad",modelId:"missing"},defaultCatalog),/existing model/);
  assert.throws(() => validateCatalog({id:"bad",kind:"model",name:"Bad"},defaultCatalog),/category and brand/);
});
test("prices accept zero but reject negative and excessive decimals", () => {
  assert.equal(catalogInput.parse({id:"x",kind:"service",name:"Test",price:"0"}).price,"0");
  for (const price of ["-1","1.234","NaN"]) assert.throws(() => catalogInput.parse({id:"x",kind:"service",name:"Test",price}));
});
test("public pricing projects catalog fields only", () => {
  const result = publicPriceList([{id:"x",kind:"service",name:"Test",price:"0",accessCode:"private"}]);
  assert.equal(result.services[0].price,0);assert.ok(!JSON.stringify(result).includes("private"));
});
