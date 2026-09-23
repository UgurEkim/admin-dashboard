export interface MeterPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: {
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: "none";
    flowControl: "none";
  }): Promise<void>;
  close(): Promise<void>;
}
export interface SerialApi {
  requestPort(): Promise<MeterPort>;
}
export function browserSerial(): SerialApi | undefined {
  return typeof navigator === "undefined"
    ? undefined
    : (navigator as Navigator & { serial?: SerialApi }).serial;
}

export class SerialConnection {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private readTask: Promise<void> | null = null;
  private pending: {
    resolve: (line: string) => void;
    reject: (error: Error) => void;
  } | null = null;
  private buffer = "";
  private closed = false;
  private closeTask: Promise<void> | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private port: MeterPort;
  private onLost: (error: Error) => void;
  private timeout: number;

  constructor(port: MeterPort, onLost: (error: Error) => void, timeout = 3000) {
    this.port = port;
    this.onLost = onLost;
    this.timeout = timeout;
  }

  async open() {
    await this.port.open({
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      flowControl: "none",
    });
    if (this.closed) {
      await this.port.close();
      throw new Error("Connection cancelled.");
    }
    if (!this.port.readable || !this.port.writable)
      throw new Error("The serial port has no readable or writable stream.");
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.readTask = this.readLoop();
  }

  private fail(error: Error) {
    if (this.closed) return;
    this.closed = true;
    this.pending?.reject(error);
    this.pending = null;
    this.onLost(error);
    void this.close();
  }

  private async readLoop() {
    const decoder = new TextDecoder("windows-1252");
    try {
      while (!this.closed && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) {
          if (!this.closed)
            this.fail(
              new Error(
                "The meter was disconnected. Reconnect its USB cable and try again.",
              ),
            );
          break;
        }
        this.buffer += decoder.decode(value, { stream: true });
        if (this.buffer.length > 8192)
          throw new Error("Unexpected serial data. Reconnect the meter.");
        let end: number;
        while ((end = this.buffer.indexOf("\n")) !== -1) {
          const line = this.buffer.slice(0, end).trim();
          this.buffer = this.buffer.slice(end + 1);
          // Some OWON firmware emits repeated OK acknowledgments for setters.
          if (!line || /^OK$/i.test(line)) continue;
          this.pending?.resolve(line);
          this.pending = null;
        }
      }
    } catch (error) {
      this.fail(
        error instanceof Error ? error : new Error("USB communication failed."),
      );
    } finally {
      this.reader?.releaseLock();
      this.reader = null;
    }
  }

  transaction<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(() => {
      if (this.closed) throw new Error("The meter is disconnected.");
      return work();
    });
    this.queue = result.catch(() => undefined);
    return result;
  }

  async write(command: string) {
    if (this.closed || !this.writer)
      throw new Error("The meter is disconnected.");
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.writer.write(new TextEncoder().encode(`${command}\n`)),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  "The meter did not accept the command. Reconnect it.",
                ),
              ),
            this.timeout,
          );
        }),
      ]);
    } catch (error) {
      this.fail(
        error instanceof Error ? error : new Error("USB write failed."),
      );
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async query(command: string): Promise<string> {
    if (this.pending) throw new Error("A meter query is already pending.");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const response = new Promise<string>((resolve, reject) => {
      this.pending = { resolve, reject };
      timer = setTimeout(
        () =>
          this.fail(
            new Error(
              `The meter did not respond to ${command}. Reconnect to try again.`,
            ),
          ),
        this.timeout,
      );
    });
    const result = Promise.all([this.write(command), response]);
    try {
      return (await result)[1];
    } finally {
      clearTimeout(timer);
      this.pending = null;
    }
  }

  close(): Promise<void> {
    if (this.closeTask) return this.closeTask;
    this.closed = true;
    this.pending?.reject(new Error("The meter is disconnected."));
    this.pending = null;
    this.closeTask = (async () => {
      await this.reader?.cancel().catch(() => undefined);
      await this.readTask;
      if (this.writer) {
        await this.writer.abort().catch(() => undefined);
        this.writer.releaseLock();
        this.writer = null;
      }
      await this.port.close().catch(() => undefined);
    })();
    return this.closeTask;
  }
}
