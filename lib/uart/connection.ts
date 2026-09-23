export interface UartSettings {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: "none" | "even" | "odd";
  flowControl: "none" | "hardware";
}

export interface UartPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: UartSettings): Promise<void>;
  close(): Promise<void>;
}

export function requestUartPort(): Promise<UartPort> {
  const serial = (
    navigator as Navigator & { serial?: { requestPort(): Promise<UartPort> } }
  ).serial;
  if (!serial || !window.isSecureContext)
    throw new Error(
      "Use Chrome or Edge on localhost or HTTPS to connect by USB.",
    );
  return serial.requestPort();
}

export interface UartConnection {
  open(settings: UartSettings): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

export class SerialUartConnection implements UartConnection {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private reading: Promise<void> | null = null;
  private opening: Promise<void> | null = null;
  private closing: Promise<void> | null = null;
  private closed = false;
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private port: UartPort,
    private receive: (bytes: Uint8Array) => void,
    private lost: (error: Error) => void,
    private writeTimeout = 5000,
  ) {}

  async open(settings: UartSettings) {
    this.opening = this.port.open(settings);
    await this.opening;
    if (this.closed) throw new Error("Connection cancelled.");
    if (!this.port.readable || !this.port.writable)
      throw new Error("This port does not provide serial data streams.");
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.reading = this.readLoop();
  }

  private fail(error: unknown) {
    if (this.closed) return;
    this.lost(
      error instanceof Error
        ? error
        : new Error("Serial communication failed."),
    );
    void this.close();
  }

  private async readLoop() {
    try {
      while (!this.closed && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) {
          if (!this.closed)
            this.fail(
              new Error(
                "The serial adapter was disconnected. Reconnect to continue.",
              ),
            );
          break;
        }
        if (!this.closed && value?.length) this.receive(value);
      }
    } catch (error) {
      this.fail(error);
    } finally {
      this.reader?.releaseLock();
      this.reader = null;
    }
  }

  write(bytes: Uint8Array): Promise<void> {
    const copy = bytes.slice();
    const task = this.queue.then(async () => {
      if (this.closed || !this.writer)
        throw new Error("Connect before sending data.");
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          this.writer.write(copy),
          new Promise<never>((_, reject) => {
            timer = setTimeout(
              () =>
                reject(new Error("Sending timed out. Reconnect the adapter.")),
              this.writeTimeout,
            );
          }),
        ]);
      } catch (error) {
        this.fail(error);
        throw error;
      } finally {
        clearTimeout(timer);
      }
    });
    this.queue = task.catch(() => {});
    return task;
  }

  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    this.closing = (async () => {
      await this.opening?.catch(() => {});
      await this.reader?.cancel().catch(() => {});
      await this.reading;
      if (this.writer) {
        await this.writer.abort().catch(() => {});
        this.writer.releaseLock();
        this.writer = null;
      }
      await this.port.close().catch(() => {});
    })();
    return this.closing;
  }
}

// Explicit demo: echo the same bytes without opening any hardware port.
export class DemoUartConnection implements UartConnection {
  private closed = true;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  constructor(private receive: (bytes: Uint8Array) => void) {}
  async open() {
    this.closed = false;
  }
  async write(bytes: Uint8Array) {
    if (this.closed) throw new Error("Demo is disconnected.");
    const copy = bytes.slice();
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.closed) this.receive(copy);
    }, 80);
    this.timers.add(timer);
  }
  async close() {
    this.closed = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
  }
}
