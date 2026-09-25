"use client";
import Link from "next/link";
import { Plus, Pencil, Download, ExternalLink } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  setDefaultPhoneCountryCode,
  phoneCountryCodes,
  type PhoneCountryCode,
} from "@/lib/customer-settings";
import {
  save,
  remove,
  publicPriceList,
  type CatalogItem,
  type CatalogKind,
} from "@/data/repositories/catalog";
import { useRecords } from "./use-records";
import { Modal, Picker, fieldClass } from "./controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const labels = {
  category: "Categories",
  brand: "Brands",
  model: "Models",
  service: "Price list",
};
export function CatalogSettings({ pricing = false }: { pricing?: boolean }) {
  const { data, loading, error } = useRecords();
  const [kind, setKind] = useState<CatalogKind>(
    pricing ? "service" : "category",
  );
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState<CatalogItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const label = (id?: string) =>
    data.catalog.find((i) => i.id === id)?.name ?? "";
  const options = (type: CatalogKind) =>
    data.catalog
      .filter((i) => i.kind === type)
      .map((i) => ({ value: i.id, label: i.name }));
  const rows = data.catalog
    .filter(
      (i) =>
        i.kind === kind &&
        [
          i.name,
          label(i.categoryId),
          label(i.brandId),
          label(i.modelId),
          i.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    try {
      await save(editing);
      setEditing(null);
      setMessage("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  function exportPrices() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(publicPriceList(data.catalog), null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "repair-price-list.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (loading)
    return <p role="status">Loading {pricing ? "pricing" : "settings"}…</p>;
  if (error) return <p role="alert">{error}</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <h1 className="text-3xl font-bold">
            {pricing ? "Pricing" : "Settings"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pricing
              ? "Manage service prices for work orders and your customer-facing price list."
              : "Manage customer defaults and your device catalog."}
          </p>
        </div>
        {pricing && (
          <Button
            nativeButton={false}
            render={
              <Link href="/pricing" target="_blank" rel="noopener noreferrer" />
            }
            variant="outline"
            className="h-9 gap-2"
          >
            <ExternalLink className="size-4" />
            View customer prices
          </Button>
        )}
      </div>
      {!pricing && (
        <>
          <Card>
            <CardContent className="max-w-sm p-5">
              <Picker
                label="Default phone country code"
                value={code || data.settings.defaultPhoneCountryCode}
                options={phoneCountryCodes.map((value) => ({
                  value,
                  label: value,
                }))}
                onChange={async (v) => {
                  if (!v) return;
                  try {
                    await setDefaultPhoneCountryCode(v as PhoneCountryCode);
                    setCode(v);
                    setMessage("");
                  } catch {
                    setMessage("Could not save the default code.");
                  }
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Used for new customers.
              </p>
            </CardContent>
          </Card>
          <div>
            <h2 className="text-xl font-semibold">Device catalog</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changes apply to new selections. Existing device details and
              work-order estimates are retained.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["category", "brand", "model"] as CatalogKind[]).map((k) => (
              <Button
                key={k}
                variant={kind === k ? "default" : "outline"}
                aria-pressed={kind === k}
                onClick={() => {
                  setKind(k);
                  setQuery("");
                }}
              >
                {labels[k]}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <label className="min-w-48 flex-1 space-y-2 text-sm font-medium">
          Search {labels[kind].toLowerCase()}
          <input
            className={fieldClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {kind === "service" && (
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={exportPrices}
          >
            <Download className="size-4" />
            Export public prices
          </Button>
        )}
        <Button
          className="h-9 gap-2"
          onClick={() => {
            setMessage("");
            setEditing({ id: crypto.randomUUID(), kind, name: "", price: "" });
          }}
        >
          <Plus className="size-4" />
          Add {kind === "service" ? "service / price" : kind}
        </Button>
      </div>
      {kind === "service" && (
        <p className="text-sm text-muted-foreground">
          Enter your customer-facing prices in euros. Leave a price blank for a
          quote. Set an optional scope for different device prices. Saved
          changes also appear on the customer price list. Existing work-order
          estimates stay unchanged.
        </p>
      )}
      {message && !editing && !deleting && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Applies to</th>
                {kind === "service" && <th className="p-4">Price (€)</th>}
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  className="border-b last:border-0 hover:bg-muted/30"
                  key={item.id}
                >
                  <td className="p-4 font-medium">
                    {item.name}
                    {item.description && (
                      <p className="mt-1 font-normal text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    {[
                      label(item.categoryId),
                      label(item.brandId),
                      label(item.modelId),
                    ]
                      .filter(Boolean)
                      .join(" · ") || "All devices"}
                  </td>
                  {kind === "service" && (
                    <td className="p-4">
                      {item.price
                        ? Number(item.price).toFixed(2)
                        : "Quote required"}
                    </td>
                  )}
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing({ ...item });
                          setMessage("");
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeleting(item);
                          setMessage("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-6 text-center text-muted-foreground">
              No matching entries.
            </p>
          )}
        </CardContent>
      </Card>
      {editing && (
        <Modal
          title={
            (data.catalog.some((i) => i.id === editing.id) ? "Edit " : "Add ") +
            (kind === "service" ? "service / price" : kind)
          }
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form className="space-y-4" onSubmit={submit}>
            <label className="block space-y-2 text-sm font-medium">
              Name *
              <input
                className={fieldClass}
                required
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            {(kind === "model" || kind === "service") && (
              <>
                <Picker
                  label={
                    kind === "model" ? "Category *" : "Category (optional)"
                  }
                  value={editing.categoryId || ""}
                  options={[
                    { value: "", label: "All categories" },
                    ...options("category"),
                  ]}
                  onChange={(v) =>
                    setEditing({ ...editing, categoryId: v, modelId: "" })
                  }
                />
                <Picker
                  label={kind === "model" ? "Brand *" : "Brand (optional)"}
                  value={editing.brandId || ""}
                  options={[
                    { value: "", label: "All brands" },
                    ...options("brand"),
                  ]}
                  onChange={(v) =>
                    setEditing({ ...editing, brandId: v, modelId: "" })
                  }
                />
              </>
            )}
            {kind === "service" && (
              <>
                <Picker
                  label="Model (optional)"
                  value={editing.modelId || ""}
                  options={[
                    { value: "", label: "All models" },
                    ...data.catalog
                      .filter(
                        (i) =>
                          i.kind === "model" &&
                          (!editing.categoryId ||
                            i.categoryId === editing.categoryId) &&
                          (!editing.brandId || i.brandId === editing.brandId),
                      )
                      .map((i) => ({
                        value: i.id,
                        label: i.name + " · " + label(i.brandId),
                      })),
                  ]}
                  onChange={(v) => setEditing({ ...editing, modelId: v })}
                />
                <label className="block space-y-2 text-sm font-medium">
                  Price (€)
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={editing.price ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, price: e.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  Public description
                  <textarea
                    rows={3}
                    className={fieldClass}
                    value={editing.description ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                  />
                </label>
              </>
            )}
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Remove catalog entry?"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <p className="text-sm">
            Remove {deleting.name} from future selections? Saved repair records
            keep their existing details.
          </p>
          {message && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {message}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                if (busy) return;
                setBusy(true);
                try {
                  await remove(deleting.id);
                  setDeleting(null);
                  setMessage("");
                } catch (e) {
                  setMessage(
                    e instanceof Error ? e.message : "Could not remove entry.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
