import type { UartSettings } from "./connection";

export interface UartPreset {
  id: string;
  label: string;
  settings: UartSettings;
  note: string;
  source: { label: string; url: string };
}

const serial8N1 = (baudRate: number): UartSettings => ({
  baudRate,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: "none",
});

// Reviewed 2026-09-24. These configure framing only, never send device commands.
export const uartPresets: readonly UartPreset[] = [
  {
    id: "ps5-emc",
    label: "PlayStation 5 — EMC / repair UART",
    settings: serial8N1(115200),
    note: "Community repair-tool settings. Use 3.3 V UART logic and the pinout for your board revision; verify your CH341A signal voltage. This configures raw UART only: PS5 error-log requests need wake-up/checksum handling, which this terminal does not automate.",
    source: {
      label: "PS5 UART reader (community source)",
      url: "https://github.com/Dejan-Port/PS5-UART-GUI/blob/main/ps5_uart_reader.py",
    },
  },
  {
    id: "esp32-console",
    label: "ESP32 — default console",
    settings: serial8N1(115200),
    note: "Default ESP-IDF console settings. Firmware can change the baud rate or console interface; match the application running on your board.",
    source: {
      label: "Espressif serial connection guide",
      url: "https://docs.espressif.com/projects/esp-idf/en/v5.2/esp32/get-started/establish-serial-connection.html",
    },
  },
  {
    id: "raspberry-pi-console",
    label: "Raspberry Pi — serial console",
    settings: serial8N1(115200),
    note: "Standard 115200 console configuration. The serial console must be enabled on the Pi; check which UART/header your model uses and its configured baud rate.",
    source: {
      label: "Raspberry Pi UART documentation",
      url: "https://www.raspberrypi.com/documentation/computers/configuration.html#configuring-uarts",
    },
  },
  {
    id: "esp8266-boot",
    label: "ESP8266 — ROM boot log",
    settings: serial8N1(74880),
    note: "For the ROM boot message at 74880 baud. Application output may switch to another baud rate after boot. Your adapter and driver must support this rate.",
    source: {
      label: "Espressif boot-log documentation",
      url: "https://docs.espressif.com/projects/esptool/en/latest/esp8266/advanced-topics/boot-mode-selection.html#boot-log",
    },
  },
  {
    id: "arduino-9600",
    label: "Arduino — Serial.begin(9600) example",
    settings: serial8N1(9600),
    note: "For sketches that use Serial.begin(9600) with default framing. Arduino has no universal baud rate: match the sketch, board voltage and serial interface.",
    source: {
      label: "Arduino Serial.begin reference",
      url: "https://docs.arduino.cc/language-reference/en/functions/communication/serial/begin/",
    },
  },
];
