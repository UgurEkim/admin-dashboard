import { useEffect, useRef, useState } from "react";
import {
  DemoUartConnection,
  SerialUartConnection,
  requestUartPort,
  type UartConnection,
  type UartSettings,
} from "@/lib/uart/connection";
import {
  encodeMessage,
  exportLog,
  type DataFormat,
  type LineEnding,
  type TerminalRecord,
} from "@/lib/uart/terminal";

const initialSettings: UartSettings = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  flowControl: "none",
};
const MAX_RECORDS = 1000;

export function useUart() {
  const [settings, setSettings] = useState(initialSettings);
  const [demo, setDemo] = useState(false);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<TerminalRecord[]>([]);
  const [counts, setCounts] = useState({ RX: 0, TX: 0 });
  const connection = useRef<UartConnection | null>(null);
  const alive = useRef(true);
  const operation = useRef(false);
  const writing = useRef(false);
  const ready = useRef(false);
  const generation = useRef(0);
  const sequence = useRef(0);
  const pending = useRef<TerminalRecord[]>([]);
  const totals = useRef({ RX: 0, TX: 0 });
  const decoders = useRef({ RX: new TextDecoder(), TX: new TextDecoder() });
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      ready.current = false;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = null;
      void connection.current?.close();
    };
  }, []);

  function append(direction: "RX" | "TX", bytes: Uint8Array) {
    if (!alive.current) return;
    totals.current[direction] += bytes.length;
    for (let offset = 0; offset < bytes.length; offset += 256) {
      const chunk = bytes.subarray(offset, offset + 256);
      pending.current.push({
        id: ++sequence.current,
        timestamp: new Date().toISOString(),
        direction,
        bytes: Array.from(chunk),
        text: decoders.current[direction].decode(chunk, { stream: true }),
      });
      if (pending.current.length > MAX_RECORDS) pending.current.shift();
    }
    if (flushTimer.current === null)
      flushTimer.current = setTimeout(() => {
        flushTimer.current = null;
        const batch = pending.current;
        pending.current = [];
        if (!alive.current) return;
        setRecords((previous) => [...previous, ...batch].slice(-MAX_RECORDS));
        setCounts({ ...totals.current });
      }, 50);
  }

  function clear() {
    pending.current = [];
    totals.current = { RX: 0, TX: 0 };
    decoders.current = { RX: new TextDecoder(), TX: new TextDecoder() };
    setRecords([]);
    setCounts({ RX: 0, TX: 0 });
  }

  async function toggleConnection() {
    if (operation.current || writing.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      if (ready.current) {
        ready.current = false;
        generation.current++;
        await connection.current?.close();
        connection.current = null;
        if (alive.current) setConnected(false);
        return;
      }
      const port = demo ? null : await requestUartPort();
      if (!alive.current) return;
      const token = ++generation.current;
      await connection.current?.close();
      if (!alive.current || generation.current !== token) return;
      const receive = (bytes: Uint8Array) => {
        if (alive.current && generation.current === token) append("RX", bytes);
      };
      let failed = false;
      const lost = (failure: Error) => {
        failed = true;
        if (!alive.current || generation.current !== token) return;
        ready.current = false;
        setConnected(false);
        setError(failure.message);
      };
      const device = port
        ? new SerialUartConnection(port, receive, lost)
        : new DemoUartConnection(receive);
      connection.current = device;
      clear();
      await device.open(settings);
      if (!alive.current || generation.current !== token || failed) {
        await device.close();
        return;
      }
      ready.current = true;
      setConnected(true);
    } catch (failure) {
      await connection.current?.close();
      connection.current = null;
      ready.current = false;
      if (alive.current) {
        setConnected(false);
        if (!(
          failure instanceof DOMException && failure.name === "NotFoundError"
        )) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not connect to the serial adapter.",
          );
        }
      }
    } finally {
      operation.current = false;
      if (alive.current) setBusy(false);
    }
  }

  async function send(
    input: string,
    format: DataFormat,
    ending: LineEnding,
  ): Promise<boolean> {
    if (
      !ready.current ||
      operation.current ||
      writing.current ||
      !connection.current
    )
      return false;
    writing.current = true;
    setSending(true);
    setError("");
    const token = generation.current;
    try {
      const bytes = encodeMessage(input, format, ending);
      await connection.current.write(bytes);
      if (!alive.current || generation.current !== token) return false;
      append("TX", bytes);
      return true;
    } catch (failure) {
      if (alive.current)
        setError(
          failure instanceof Error ? failure.message : "Could not send data.",
        );
      return false;
    } finally {
      writing.current = false;
      if (alive.current) setSending(false);
    }
  }

  function download() {
    const retained = [...records, ...pending.current].slice(-MAX_RECORDS);
    const url = URL.createObjectURL(
      new Blob([exportLog(retained)], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `uart-${demo ? "demo-" : ""}${new Date().toISOString().replaceAll(":", "-")}.log`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    settings,
    setSettings,
    demo,
    setDemo: (next: boolean) => {
      if (ready.current || operation.current || writing.current) return;
      setDemo(next);
      clear();
      setError("");
    },
    connected,
    busy,
    sending,
    error,
    records,
    counts,
    clear,
    toggleConnection,
    send,
    download,
  };
}
