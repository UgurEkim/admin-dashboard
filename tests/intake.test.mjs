import "./register-typescript.cjs";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const {orderInput} = require("../data/schemas.ts");
const {normalizeImport,readBrowserImport} = require("../data/legacy-import.ts");
const base = {customerId:"c",deviceId:"d",issue:"HDMI"};
test("intake fields and zero cost are retained", () => {
 const order = orderInput.parse({...base,estimate:"0",accessCode:"1234",intakeCondition:"Scratched",accessories:"Cable"});
 assert.equal(order.accessCode,"1234");assert.equal(order.estimate,"0");assert.equal(order.accessories,"Cable");
});
test("unsafe and excessive photos are rejected", () => {
 assert.throws(() => orderInput.parse({...base,intakePhotos:[{id:"x",name:"x",dataUrl:"data:image/svg+xml,<svg/>"}]}));
 assert.throws(() => orderInput.parse({...base,intakePhotos:Array(5).fill({id:"x",name:"x",dataUrl:"data:image/jpeg;base64,/9j/2Q=="})}));
});
test("old statuses normalize and approval metadata is discarded", () => {
 const date = new Date().toISOString();
 const data = normalizeImport({customers:[],devices:[],catalog:[],orders:[{...base,id:"WO-1",createdAt:date,updatedAt:date,status:"Awaiting approval",approvalSignature:"Old"}]});
 assert.equal(data.orders[0].status,"Waiting");assert.equal(data.orders[0].approvalSignature,undefined);
});
test("browser migration reads both legacy formats without changing storage", () => {
 const values = new Map([["repair-admin.customers",JSON.stringify({version:1,data:[]})],["repair-admin.devices","[]"],["repair-admin.sequence.WO","19"]]);
 globalThis.window={localStorage:{getItem:key=>values.get(key)??null,setItem:()=>assert.fail("must not write")}};
 const data=readBrowserImport();assert.equal(data.sequences.WO,19);assert.ok(data.catalog.length);
});
test("unsupported backups fail instead of silently clearing records", () => {
 assert.throws(()=>normalizeImport({version:2,customers:[],devices:[],orders:[],catalog:[]}));
 assert.throws(()=>normalizeImport({customers:[]}));
});
