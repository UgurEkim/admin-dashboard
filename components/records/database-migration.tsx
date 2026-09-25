"use client";
import { useState } from "react";
import { readBrowserImport, normalizeImport } from "@/data/legacy-import";
import type { Snapshot } from "@/data/schemas";
import { request } from "@/data/repositories/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "./controls";

export function DatabaseMigration() {
  const [preview, setPreview] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function error(value: unknown) {
    setFailed(true);
    setMessage(
      value instanceof Error ? value.message : "Could not import records.",
    );
  }
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold">Database & migration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Business records are stored in PostgreSQL. Import your old browser
            records or a backup into an empty database. Your browser copy will
            be kept.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              try {
                const next = readBrowserImport();
                setPreview(next);
                setFailed(false);
                setMessage(
                  next ? "" : "No previous records were found in this browser.",
                );
              } catch (e) {
                error(e);
              }
            }}
          >
            Review browser records
          </Button>
          <label className="text-sm">
            Import backup
            <input
              className="ml-2 max-w-full text-sm"
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  if (file.size > 32 * 1024 * 1024)
                    throw new Error("Backup exceeds the 32 MB limit.");
                  setPreview(normalizeImport(JSON.parse(await file.text())));
                  setMessage("");
                  setFailed(false);
                } catch (e) {
                  error(e);
                }
              }}
            />
          </label>
        </div>
        {message && (
          <p
            role={failed ? "alert" : "status"}
            className={failed ? "text-sm text-destructive" : "text-sm"}
          >
            {message}
          </p>
        )}
        {preview && (
          <Modal
            title="Import into PostgreSQL?"
            onClose={() => {
              if (!busy) setPreview(null);
            }}
          >
            <p className="text-sm">
              Import {preview.customers.length} customers,{" "}
              {preview.devices.length} devices, {preview.orders.length} work
              orders and {preview.catalog.length} catalog entries, including
              prices and the default phone code?
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Existing database records will not be overwritten. The import
              either completes in full or makes no changes. Browser records stay
              available as a backup.
            </p>
            {failed && message && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {message}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setPreview(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  try {
                    const result = await request<{ alreadyImported: boolean }>({
                      action: "import",
                      data: preview,
                    });
                    setPreview(null);
                    setFailed(false);
                    setMessage(
                      result.alreadyImported
                        ? "These records were already imported. No duplicates were created."
                        : "Import complete. Your records are now in PostgreSQL; the browser copy is unchanged.",
                    );
                  } catch (e) {
                    error(e);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Importing..." : "Import records"}
              </Button>
            </div>
          </Modal>
        )}
      </CardContent>
    </Card>
  );
}
