"use client";

import { useEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import {
  Download,
  Eraser,
  LoaderCircle,
  Plug,
  Send,
  Terminal,
  Unplug,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUart } from "@/components/uart/use-uart";
import {
  formatHex,
  visibleText,
  type DataFormat,
  type LineEnding,
} from "@/lib/uart/terminal";
import type { UartSettings } from "@/lib/uart/connection";
import { uartPresets } from "@/lib/uart/presets";
import { extractPs5Codes } from "@/lib/uart/ps5-decoder";

function Field({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select
        {...props}
        className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-50"
      >
        {children}
      </select>
    </label>
  );
}

export default function UartTerminalPage() {
  const uart = useUart();
  const [presetId, setPresetId] = useState("custom");
  const preset = uartPresets.find((item) => item.id === presetId);
  const [command, setCommand] = useState("");
  const [sendFormat, setSendFormat] = useState<DataFormat>("text");
  const [displayFormat, setDisplayFormat] = useState<DataFormat>("text");
  const [ending, setEnding] = useState<LineEnding>("crlf");
  const [autoScroll, setAutoScroll] = useState(true);
  const [timestamps, setTimestamps] = useState(true);
  const output = useRef<HTMLDivElement>(null);
  const locked = uart.connected || uart.busy || uart.sending;
  const ps5Codes = extractPs5Codes(
    uart.records
      .filter((row) => row.direction === "RX")
      .map((row) => row.text)
      .join(" "),
  );
  function changeSettings(settings: UartSettings) {
    if (locked) return;
    setPresetId("custom");
    uart.setSettings(settings);
  }

  function selectPreset(id: string) {
    if (locked) return;
    const selected = uartPresets.find((item) => item.id === id);
    setPresetId(selected?.id ?? "custom");
    if (selected) uart.setSettings({ ...selected.settings });
  }
  useEffect(() => {
    if (autoScroll && output.current)
      output.current.scrollTop = output.current.scrollHeight;
  }, [uart.records, autoScroll, displayFormat]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UART Terminal</h1>
        <p className="mt-1 text-muted-foreground">
          Send and receive serial data through your USB adapter.
        </p>
      </div>
      {uart.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {uart.error}
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Plug className="size-5" />
              Connection
            </CardTitle>
            <Badge
              variant="outline"
              className={
                uart.demo
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : uart.connected
                    ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                    : "text-muted-foreground"
              }
            >
              {uart.busy
                ? "Please wait…"
                : uart.connected
                  ? uart.demo
                    ? "Demo connected"
                    : "Connected"
                  : uart.demo
                    ? "Demo selected"
                    : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <Field
              label="Device preset"
              value={presetId}
              disabled={locked}
              onChange={(event) => selectPreset(event.target.value)}
            >
              <option value="custom">Custom settings</option>
              {uartPresets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Field>
            <div
              className="space-y-1 text-xs text-muted-foreground lg:col-span-2 lg:pt-7"
              aria-live="polite"
            >
              {preset ? (
                <>
                  <p className="font-medium text-foreground">
                    {preset.settings.baudRate.toLocaleString("en-US")} baud ·
                    8N1 · No flow control
                  </p>
                  <p>{preset.note}</p>
                  <a
                    className="text-sky-700 underline underline-offset-2 dark:text-sky-400"
                    href={preset.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {preset.source.label}
                  </a>
                </>
              ) : (
                <p>
                  Select a device to fill in its connection settings, or adjust
                  them below. Presets do not change line endings, send commands,
                  or set adapter voltage.
                </p>
              )}
            </div>
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Field
              label="Source"
              value={uart.demo ? "demo" : "serial"}
              disabled={locked}
              onChange={(event) => uart.setDemo(event.target.value === "demo")}
            >
              <option value="serial">USB serial adapter</option>
              <option value="demo">Demo loopback</option>
            </Field>
            <Field
              label="Baud rate"
              value={uart.settings.baudRate}
              disabled={locked}
              onChange={(event) =>
                changeSettings({
                  ...uart.settings,
                  baudRate: Number(event.target.value),
                })
              }
            >
              {[
                1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200,
                230400, 460800, 921600,
              ].map((rate) => (
                <option key={rate} value={rate}>
                  {rate.toLocaleString("en-US")}
                </option>
              ))}
            </Field>
            <Field
              label="Data bits"
              value={uart.settings.dataBits}
              disabled={locked}
              onChange={(event) =>
                changeSettings({
                  ...uart.settings,
                  dataBits: Number(event.target.value) as 7 | 8,
                })
              }
            >
              <option value={7}>7</option>
              <option value={8}>8</option>
            </Field>
            <Field
              label="Parity"
              value={uart.settings.parity}
              disabled={locked}
              onChange={(event) =>
                changeSettings({
                  ...uart.settings,
                  parity: event.target.value as UartSettings["parity"],
                })
              }
            >
              <option value="none">None</option>
              <option value="even">Even</option>
              <option value="odd">Odd</option>
            </Field>
            <Field
              label="Stop bits"
              value={uart.settings.stopBits}
              disabled={locked}
              onChange={(event) =>
                changeSettings({
                  ...uart.settings,
                  stopBits: Number(event.target.value) as 1 | 2,
                })
              }
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </Field>
            <Field
              label="Flow control"
              value={uart.settings.flowControl}
              disabled={locked}
              onChange={(event) =>
                changeSettings({
                  ...uart.settings,
                  flowControl: event.target
                    .value as UartSettings["flowControl"],
                })
              }
            >
              <option value="none">None</option>
              <option value="hardware">RTS / CTS</option>
            </Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-xs text-muted-foreground">
              {uart.demo
                ? "Demo echoes sent bytes without accessing hardware. Serial settings are not simulated."
                : "Use Chrome or Edge. Connect opens the browser’s port chooser. Your CH341A must be in UART mode and appear as a COM port; close other apps using that port."}
            </p>
            <Button
              type="button"
              disabled={uart.busy || uart.sending}
              onClick={uart.toggleConnection}
              variant={uart.connected ? "outline" : "default"}
            >
              {uart.busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : uart.connected ? (
                <Unplug className="size-4" />
              ) : (
                <Plug className="size-4" />
              )}
              {uart.busy
                ? "Please wait…"
                : uart.connected
                  ? "Disconnect"
                  : uart.demo
                    ? "Start demo"
                    : "Connect"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="size-5" />
              Serial monitor
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                RX {uart.counts.RX.toLocaleString()} bytes
              </span>
              <span className="font-mono text-sky-700 dark:text-sky-400">
                TX {uart.counts.TX.toLocaleString()} bytes
              </span>
              <Button variant="outline" type="button" onClick={uart.clear}>
                <Eraser className="size-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={!uart.records.length}
                onClick={uart.download}
              >
                <Download className="size-4" />
                Export log
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Display
              <select
                className="h-8 rounded-lg border bg-background px-2"
                value={displayFormat}
                onChange={(event) =>
                  setDisplayFormat(event.target.value as DataFormat)
                }
              >
                <option value="text">Text (UTF-8)</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={timestamps}
                onChange={(event) => setTimestamps(event.target.checked)}
              />
              Timestamps
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(event) => setAutoScroll(event.target.checked)}
              />
              Auto-scroll
            </label>
          </div>
          <div
            ref={output}
            tabIndex={0}
            role="region"
            aria-label="Serial output"
            className="h-[26rem] overflow-auto rounded-xl border bg-muted/30 p-3 font-mono text-xs sm:text-sm"
          >
            {!uart.records.length ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                {uart.connected
                  ? "Listening. Send a message to get started."
                  : "Connect an adapter or start the demo to see serial data."}
              </div>
            ) : (
              uart.records.map((row) => (
                <div
                  key={row.id}
                  className="flex items-start gap-3 border-b border-border/40 py-1.5 last:border-0"
                >
                  {timestamps && (
                    <time
                      dateTime={row.timestamp}
                      className="shrink-0 text-muted-foreground"
                    >
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </time>
                  )}
                  <span
                    className={`shrink-0 font-semibold ${row.direction === "RX" ? "text-emerald-700 dark:text-emerald-400" : "text-sky-700 dark:text-sky-400"}`}
                  >
                    {row.direction}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap break-all">
                    {displayFormat === "hex"
                      ? formatHex(row.bytes)
                      : visibleText(row.text) || "[partial UTF-8 character]"}
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Latest 1,000 chunks, up to 256 bytes each. Counts reset on Clear or
            a new connection. Text is UTF-8; hex and exported logs preserve the
            exact bytes.
          </p>
          {ps5Codes.length > 0 && (
            <div className="space-y-2 rounded-lg border border-amber-300/50 bg-amber-50/40 p-3 dark:border-amber-700/40 dark:bg-amber-950/20">
              <p className="text-sm font-semibold">
                PS5 error-code translation
              </p>
              {ps5Codes.map((item) => (
                <div
                  key={item.code}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
                >
                  <code className="font-semibold">{item.code}</code>
                  <span>{item.description}</span>
                  {item.confidence === "unknown" && (
                    <span className="text-xs text-muted-foreground">
                      Unknown locally — retain the raw code
                    </span>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Reference descriptions are not a diagnosis. PS5 codes can depend
                on board revision, firmware, and surrounding errlog fields.
              </p>
            </div>
          )}
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const sent = command;
              if (await uart.send(sent, sendFormat, ending))
                setCommand((current) => (current === sent ? "" : current));
            }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Send as"
                value={sendFormat}
                disabled={uart.sending}
                onChange={(event) =>
                  setSendFormat(event.target.value as DataFormat)
                }
              >
                <option value="text">Text (UTF-8)</option>
                <option value="hex">Hexadecimal bytes</option>
              </Field>
              <Field
                label="Line ending"
                value={ending}
                disabled={sendFormat === "hex" || uart.sending}
                onChange={(event) =>
                  setEnding(event.target.value as LineEnding)
                }
              >
                <option value="none">None</option>
                <option value="lf">LF</option>
                <option value="cr">CR</option>
                <option value="crlf">CR + LF</option>
              </Field>
            </div>
            <label className="block text-sm font-medium" htmlFor="uart-message">
              Message
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="uart-message"
                className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-sm disabled:opacity-50"
                value={command}
                maxLength={196608}
                disabled={!uart.connected || uart.sending || uart.busy}
                onChange={(event) => setCommand(event.target.value)}
                placeholder={
                  sendFormat === "hex" ? "48 65 6C 6C 6F" : "Enter a message…"
                }
                autoComplete="off"
              />
              <Button
                className="h-10"
                type="submit"
                disabled={
                  !uart.connected ||
                  uart.sending ||
                  uart.busy ||
                  (!command && (sendFormat === "hex" || ending === "none"))
                }
              >
                {uart.sending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {uart.sending ? "Sending…" : "Send"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {sendFormat === "hex"
                ? "Hex sends exactly the bytes entered; no line ending is added."
                : "Press Enter to send. Spaces are preserved and the selected line ending is appended."}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
