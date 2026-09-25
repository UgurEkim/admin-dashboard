// Remove this development-only gate when real authentication protects the dashboard/API.
const origin = new URL(process.env.APP_URL || "http://localhost:8080");
if (
  process.env.ALLOW_UNAUTHENTICATED_LOCAL !== "true" ||
  !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
) {
  throw new Error(
    "Authentication is not implemented yet. This image currently supports explicit localhost-only evaluation (ALLOW_UNAUTHENTICATED_LOCAL=true and a local APP_URL).",
  );
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
await import("./server.js");
