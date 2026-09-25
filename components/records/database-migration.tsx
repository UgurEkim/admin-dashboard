"use client";
import { useRef, useState } from "react";
import { normalizeImport } from "@/data/legacy-import";
import type { Snapshot } from "@/data/schemas";
import { request } from "@/data/repositories/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "./controls";
import { Download, Upload, Database } from "lucide-react";
import { getSnapshot } from "@/data/repositories/api";
import { createBackup } from "@/data/backup";

export function DatabaseMigration() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  async function downloadBackup() {
    if (backingUp || busy) return;
    setBackingUp(true);
    setMessage("");
    setFailed(false);
    try {
      const backup = createBackup(await getSnapshot());
      const url = URL.createObjectURL(
        new Blob([backup.content], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        "Backup download started. Keep the downloaded file somewhere safe.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBackingUp(false);
    }
  }
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
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Database className="size-5" />
            Database backups
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download all customers, devices, work orders, photos, repair
            history, catalog entries, prices and settings in one backup.
          </p>
        </div>
        <Button
          className="h-9 gap-2"
          disabled={busy || backingUp}
          onClick={downloadBackup}
        >
          <Download className="size-4" />
          {backingUp ? "Creating backup..." : "Download full backup"}
        </Button>
        <p className="text-xs text-muted-foreground">
          The file includes personal information and saved device PINs. It is an
          unencrypted JSON backup of your application data.
        </p>
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium">Restore backup</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Import the JSON file created by Download full backup into an empty
            database. Existing records will not be overwritten.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="h-9 gap-2"
            disabled={busy || backingUp}
            onClick={() => fileInput.current?.click()}
          >
            <Upload className="size-4" />
            Import backup
          </Button>
          <input
            ref={fileInput}
            hidden
            aria-label="Select JSON backup"
            type="file"
            accept=".json,application/json"
            disabled={busy || backingUp}
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
              either completes in full or makes no changes.
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
                        : "Restore complete. Your records are now in PostgreSQL.",
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
