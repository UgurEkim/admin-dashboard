# OWON XDM1041 multimeter

The multimeter screen uses Web Serial directly from the browser. No server-side USB access, external bridge, or mock readings are used by the application.

## Connect

1. Open `/dashboard/tools/multimeter` in desktop Chrome or Edge on localhost or HTTPS.
2. Connect the XDM1041 USB cable and close other software using its port.
3. Click **Connect to device**, then select the meter (on the development machine: USB-SERIAL CH340, COM3).
4. The application verifies the identity and reads the existing mode without changing it. Click **Start** to record.
5. **Stop** pauses the application's readings; the instrument continues measuring. **Disconnect** releases the port. Page navigation also releases it.

The browser asks permission to access the local serial port. COM3 is a setup hint, not a hardcoded connection: choose the current meter port if Windows assigns another number. Serial settings are 115200 baud, 8 data bits, no parity, one stop bit, no flow control.

## Measurements

- DC/AC voltage and current
- Resistance, continuity and diode
- Capacitance, frequency and period
- Temperature with PT100 or K-type (KITS90), in Celsius, Fahrenheit or Kelvin
- Automatic and manual range for voltage, current, resistance and capacitance

Mode/range/probe changes stop recording and clear the previous series after success. Press Start to resume. The application reads back the accepted settings. Front-panel mode changes detected during recording start a new series; a sample spanning two modes is discarded.

Mode selection changes the physical instrument function. Use the correct meter terminals and probe arrangement for the selected measurement, following the instrument manual.

Read interval controls the pause between completed application reads; it does not alter the meter's conversion rate. No unverified RATE commands are sent (this V4.3.0 unit returns S, unlike the shared manual's F/M/L values).

Readings retain base units, signed scientific values, ISO timestamps, mode and overload status. OL / 1E+9 is treated as overload/open input, not zero. Overloads create graph gaps and are excluded from statistics. History retains the latest 1,000 samples and the graph shows the latest 120. CSV exports the current history; it is not persisted after a reload. Reset readings affects the application only, never sends *RST.

## Validation and known limits

The connected unit identified as OWON XDM1041, firmware V4.3.0. Direct serial checks verified all listed primary functions, manual range indexes, both temperature probes and all three temperature units. Those checks used disconnected test leads; they verify communication and accepted settings, not calibrated accuracy against known electrical sources.

The XDM1041 may briefly return a cached conversion after a mode change. Configuration waits for settling and does not automatically start recording. Allow the meter to settle before recording, particularly for capacitance or temperature.

Disconnect/timeouts close the transport rather than reusing a possibly misaligned response stream. Reconnect manually. Firmware acknowledgments are ignored; command responses are line-buffered and command transactions are serialized.

The shared XDM1041/XDM2041 manual also mentions four-wire resistance and device math functions. These are not exposed as XDM1041 measurement modes. This screen records the primary reading; the instrument's optional secondary AC frequency display is not separately recorded.

## Tests

`npm run test:multimeter` runs dependency-free protocol, transport, and adapter tests using Node's built-in test runner and the existing TypeScript compiler.

An optional Windows hardware test runs the application adapter through a test-only PowerShell serial bridge. It changes measurement modes and restores DC voltage auto range. Disconnect test leads from circuits and components first, close any browser/OWON connection, then run:

```
node tests/owon-hardware.mjs --leads-disconnected
```

The test bridge is only a development test fixture and is not used or served by the application.

## References

- OWON programming manual: https://files.owon.com.cn/software/Application/XDM1000_Digital_Multimeter_Programming_Manual.pdf
- Mirror of the OWON manual: https://static.eleshop.nl/mage/media/downloads/XDM1000_Digital_Multimeter_Programming_Manual.pdf
- Independent hardware investigation (serial settings and firmware acknowledgment behavior): https://github.com/TheHWcave/OWON-XDM1041
- Web Serial API: https://developer.chrome.com/docs/capabilities/serial
