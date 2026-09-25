import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { customerInput,deviceInput,orderInput } = require("../data/schemas.ts");
test("customer schema keeps address and requires contact", () => {
  const customer = customerInput.parse({name:"Test",phone:"123",street:"Street",houseNumber:"12",postalCode:"1234 AB",city:"City"});
  assert.equal(customer.street,"Street");assert.equal(customer.houseNumber,"12");assert.equal(customer.city,"City");
  assert.throws(() => customerInput.parse({name:"Test"}));
});
test("device schema requires customer, model and category", () => {
  assert.throws(() => deviceInput.parse({name:"PS5"}));
  assert.equal(deviceInput.parse({name:"PS5",customerId:"CUS-1",model:"CFI",category:"Console"}).name,"PS5");
});
test("work orders accept direct status transitions without approval data", () => {
  for (const status of ["Waiting","Repairing","Testing","Completed"]) {
    const order = orderInput.parse({customerId:"c",deviceId:"d",issue:"HDMI",status,approvalStatus:"Pending"});
    assert.equal(order.status,status);assert.equal(order.approvalStatus,undefined);
  }
});
