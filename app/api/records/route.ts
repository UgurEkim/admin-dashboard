import "server-only";
import { RecordError } from "@/server/record-error";
import { z } from "zod";
import {
  readSnapshot,
  saveRecord,
  deleteRecord,
  importSnapshot,
} from "@/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const command = z.object({
  action: z.enum(["save", "delete", "import"]),
  collection: z
    .enum(["customers", "devices", "orders", "catalog", "settings"])
    .optional(),
  id: z.string().min(1).max(100).optional(),
  data: z.unknown().optional(),
});
function localRequest(request: Request) {
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    throw new RecordError(
      "This development dashboard is available on localhost only.",
    );
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin)
    throw new RecordError("Cross-origin requests are not allowed.");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new RecordError("Cross-site requests are not allowed.");
}
function failure(error: unknown) {
  const message =
    error instanceof z.ZodError
      ? error.issues[0]?.message
      : error instanceof RecordError
        ? error.message
        : "The database request could not be completed. Check the database connection and try again.";
  return Response.json(
    { error: message },
    {
      status:
        error instanceof RecordError || error instanceof z.ZodError ? 400 : 503,
    },
  );
}
export async function GET(request: Request) {
  try {
    localRequest(request);
    return Response.json(await readSnapshot(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    localRequest(request);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new RecordError("Expected JSON.");
    // Bound migration/photo requests even when Content-Length is absent.
    const reader = request.body?.getReader();
    if (!reader) throw new RecordError("Missing request body.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 32 * 1024 * 1024) {
        await reader.cancel();
        throw new RecordError("Import exceeds the 32 MB limit.");
      }
      chunks.push(value);
    }
    const input = command.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (input.action === "import")
      return Response.json(await importSnapshot(input.data));
    if (!input.collection) throw new RecordError("Choose a record type.");
    if (input.action === "delete") {
      if (!input.id) throw new RecordError("Choose a record to delete.");
      return Response.json(await deleteRecord(input.collection, input.id));
    }
    return Response.json(
      await saveRecord(input.collection, input.data, input.id),
    );
  } catch (error) {
    return failure(error);
  }
}
