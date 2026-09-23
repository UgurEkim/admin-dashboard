# UART terminal

Open `/dashboard/tools/uart` in desktop Chrome or Edge using localhost or HTTPS. Select the serial framing used by the target device, click **Connect**, and choose the USB adapter in the browser's port chooser. Default settings are 115200 baud, 8 data bits, no parity, one stop bit, and no flow control. Settings are locked while connected. No fixed COM number or automatic device commands are used.

## CH341A

The CH341 can provide UART as well as synchronous/programmer interfaces. This terminal uses the serial interface: the board must be configured for UART and appear as a COM port in Windows. An adapter in SPI/I²C programmer mode is not a serial terminal port. Board jumper layouts differ; follow the documentation for your specific board rather than assuming a pin position. If needed, the official WCH CH341SER driver is linked below.

With no target attached, connecting and sending is possible, but receiving nothing is normal. For a physical loopback test, disconnect any target, identify the board's UART TXD and RXD pins, and connect TXD to RXD. Connect the adapter, select flow control **None**, and send a message. The same bytes should appear as RX. Do not connect a supply pin for this loopback. Before connecting a future target, verify compatible UART voltage levels and share ground; the application cannot detect pin voltage or wiring.

## Try without hardware

Select **Demo loopback**, then **Start demo**. Each transmission is echoed as RX after a short delay. The demo never opens a USB port and does not simulate baud rate or electrical faults. Its badge and export filename identify demo data. Switching source or starting a new connection clears the current log.

## Sending and receiving

- Text uses UTF-8, preserves spaces, and appends the chosen line ending (none, LF, CR, or CR+LF). Enter sends the message.
- Hex accepts complete byte pairs with optional whitespace, such as `00 FF 0A`. It sends exactly those bytes, without any appended line ending. Invalid input is rejected before transmission.
- A send is limited to 64 KiB. TX means the browser accepted the write, not that the remote device acknowledged it.
- The monitor displays incoming chunks immediately without waiting for a newline. Chunks are not protocol packets. Text decoding spans receive chunks; hexadecimal view retains every byte, including incomplete or invalid UTF-8.
- Control characters are displayed visibly. ANSI terminal emulation, cursor commands, and HTML interpretation are not implemented.
- Incoming eight-digit hexadecimal values can be translated in the PS5 error-code panel. The decoder ignores `00000000` and `FFFFFFFF` sentinels, recognizes a small conservative local reference set, and keeps unknown codes visible. It does not send `errlog` commands, wake the console, clear errors, or claim a repair diagnosis.
- RX and TX have separate colors, byte counts, and timestamps. Auto-scroll can be turned off to inspect earlier output. Clear resets the log and counters without disconnecting.
- Rendering is batched every 50 ms. Both pending and visible logs retain at most 1,000 chunks of up to 256 bytes each. Counters include bytes dropped from this bounded history. This is a monitor, not a lossless long-term recorder.
- Export saves retained records as tab-separated ISO time, direction, exact hexadecimal bytes, and JSON-escaped decoded text. Logs are not persisted across reloads.

Disconnect and page navigation release the serial port. Unplugging, stream errors, and write timeouts stop the connection and show an error; reconnect manually. Other applications cannot share the same open port. RTS/CTS requires compatible adapter pins and target wiring; leave flow control off when unused.

## Structure and checks

- `lib/uart/connection.ts`: byte-oriented connection interface, Web Serial implementation, and explicit demo implementation. UART intentionally does not use the multimeter's line/query transport, which filters acknowledgements and waits for command responses.
- `lib/uart/terminal.ts`: message encoding, input validation, hexadecimal formatting, and log export.
- `components/uart/use-uart.ts`: connection lifecycle, bounded recording, UTF-8 streaming decoding, counters, and send state.
- `app/dashboard/tools/uart/page.tsx`: presentation and controls.

Run `npm run test:uart`, or `node --test tests/uart.test.mjs`. Type-check with `node node_modules/typescript/bin/tsc --noEmit -p tests/tsconfig.uart.json`. Fake-stream tests cover exact bytes, framing settings, disconnects, serialized writes, timeout, close during open, malformed hex, and demo cancellation. Hardware verification still requires the actual adapter and wiring.

## References

- [WCH CH341 product information](https://www.wch-ic.com/products/CH341.html)
- [WCH CH341SER Windows driver](https://www.wch-ic.com/downloads/CH341SER.EXE.html)
- [Chrome Web Serial guide](https://developer.chrome.com/docs/capabilities/serial)
- [PS5 UART reader source and community code database](https://github.com/Dejan-Port/PS5-UART-GUI)
- [PS5 UART protocol research](https://github.com/symbrkrs/ps5-uart)
