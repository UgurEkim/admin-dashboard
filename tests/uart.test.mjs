import { createRequire } from "node:module";
import "./register-typescript.cjs";
const require = createRequire(import.meta.url);
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  SerialUartConnection,
  DemoUartConnection,
} = require("../lib/uart/connection.ts");
const {
  encodeMessage,
  formatHex,
  visibleText,
  exportLog,
} = require("../lib/uart/terminal.ts");
const settings = {
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: "none",
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

function fakePort(write = () => {}) {
  let source;
  return {
    closed: false,
    readable: new ReadableStream({
      start(controller) {
        source = controller;
      },
    }),
    writable: new WritableStream({ write }),
    async open(options) {
      assert.deepEqual(options, settings);
    },
    async close() {
      this.closed = true;
    },
    receive(bytes) {
      source.enqueue(Uint8Array.from(bytes));
    },
    unplug() {
      source.close();
    },
  };
}

test("text preserves whitespace, UTF-8 and all line endings", () => {
  for (const [ending, suffix] of Object.entries({
    none: "",
    lf: "\n",
    cr: "\r",
    crlf: "\r\n",
  })) {
    assert.equal(
      new TextDecoder().decode(encodeMessage(" Ω ", "text", ending)),
      " Ω " + suffix,
    );
  }
  assert.deepEqual([...encodeMessage("", "text", "crlf")], [13, 10]);
  assert.throws(() => encodeMessage("", "text", "none"));
  assert.throws(() => encodeMessage("a".repeat(65537), "text", "none"));
});

test("hex transmits exact bytes and rejects malformed input", () => {
  assert.deepEqual(
    [...encodeMessage("00 ff 0A 80", "hex", "crlf")],
    [0, 255, 10, 128],
  );
  for (const bad of ["", "0", "GG", "0xFF", "12,34"])
    assert.throws(() => encodeMessage(bad, "hex", "none"));
  assert.equal(formatHex([0, 255, 10]), "00 FF 0A");
  assert.equal(visibleText("\u001b[31m\r\n"), "\\x1b[31m␍\n");
});

test("logs preserve binary bytes and escape text newlines", () => {
  assert.equal(
    exportLog([
      {
        timestamp: "now",
        direction: "RX",
        bytes: [0, 255],
        text: "a\n",
        id: 1,
      },
    ]),
    'now\tRX\t00 FF\t"a\\n"',
  );
});

test("serial receives arbitrary chunks without waiting for newline, writes exact bytes and releases locks", async () => {
  const writes = [],
    reads = [],
    failures = [];
  const port = fakePort((bytes) => writes.push([...bytes]));
  const device = new SerialUartConnection(
    port,
    (bytes) => reads.push([...bytes]),
    (error) => failures.push(error),
  );
  await device.open(settings);
  port.receive([0, 255, 13]);
  await device.write(Uint8Array.from([32, 0, 255]));
  await tick();
  assert.deepEqual(reads, [[0, 255, 13]]);
  assert.deepEqual(writes, [[32, 0, 255]]);
  await device.close();
  await device.close();
  assert.equal(port.closed, true);
  assert.equal(port.readable.locked, false);
  assert.equal(port.writable.locked, false);
  assert.deepEqual(failures, []);
  await assert.rejects(device.write(new Uint8Array([1])));
});

test("unplug closes the connection and reports once", async () => {
  const failures = [];
  const port = fakePort();
  const device = new SerialUartConnection(
    port,
    () => {},
    (error) => failures.push(error),
  );
  await device.open(settings);
  port.unplug();
  await tick();
  await device.close();
  assert.equal(failures.length, 1);
  assert.equal(port.closed, true);
  assert.equal(port.readable.locked, false);
});

test("queued writes preserve order and copy the caller's bytes", async () => {
  const writes = [];
  const port = fakePort(async (bytes) => {
    await tick();
    writes.push([...bytes]);
  });
  const device = new SerialUartConnection(
    port,
    () => {},
    () => {},
  );
  await device.open(settings);
  const bytes = new Uint8Array([1]);
  const first = device.write(bytes);
  bytes[0] = 9;
  await Promise.all([first, device.write(new Uint8Array([2]))]);
  assert.deepEqual(writes, [[1], [2]]);
  await device.close();
});

test("closing during open waits and releases the port", async () => {
  let finishOpen;
  const port = fakePort();
  port.open = () =>
    new Promise((resolve) => {
      finishOpen = resolve;
    });
  const device = new SerialUartConnection(
    port,
    () => {},
    () => {},
  );
  const opening = assert.rejects(device.open(settings), /cancelled/);
  const closing = device.close();
  finishOpen();
  await Promise.all([opening, closing]);
  assert.equal(port.closed, true);
});

test("write failure reports disconnect and closes the port", async () => {
  const failures = [];
  const port = fakePort(() => {
    throw new Error("write failed");
  });
  const device = new SerialUartConnection(
    port,
    () => {},
    (error) => failures.push(error),
  );
  await device.open(settings);
  await assert.rejects(device.write(new Uint8Array([1])), /write failed/);
  await device.close();
  assert.equal(failures.length, 1);
  assert.equal(port.closed, true);
});

test("write timeout rejects queued sends and closes after in-flight write settles", async () => {
  let finishWrite;
  const port = fakePort(
    () =>
      new Promise((resolve) => {
        finishWrite = resolve;
      }),
  );
  const device = new SerialUartConnection(
    port,
    () => {},
    () => {},
    10,
  );
  await device.open(settings);
  const first = assert.rejects(device.write(new Uint8Array([1])), /timed out/);
  const second = assert.rejects(device.write(new Uint8Array([2])), /Connect/);
  await Promise.all([first, second]);
  finishWrite();
  await device.close();
  assert.equal(port.closed, true);
});

test("demo echoes exact bytes and cancels pending echoes on disconnect", async () => {
  const received = [];
  const demo = new DemoUartConnection((bytes) => received.push([...bytes]));
  await demo.open(settings);
  await demo.write(new Uint8Array([0, 255]));
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepEqual(received, [[0, 255]]);
  await demo.write(new Uint8Array([1]));
  await demo.close();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.deepEqual(received, [[0, 255]]);
});
