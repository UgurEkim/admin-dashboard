"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, ArrowLeft, Download } from "lucide-react";
import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
} from "@/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal, Picker } from "./controls";
import { Editor, singular, statuses, choices, type Kind } from "./editor";
import { useRecords } from "./use-records";

const titles = {
  customers: "Customers",
  devices: "Devices",
  "work-orders": "Work orders",
};
const descriptions = {
  customers: "Contact details, devices and repair history in one place.",
  devices: "Customer-owned electronics and their complete repair history.",
  "work-orders": "Track intake, repairs, testing and collection.",
};
const money = (value?: string) =>
  value
    ? new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(Number(value))
    : "—";
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

export function Workspace({
  kind,
  detail = false,
}: {
  kind: Kind;
  detail?: boolean;
}) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error } = useRecords();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [editor, setEditor] = useState<{
    kind: Kind;
    id?: string;
    preset?: Record<string, string>;
  } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [deletingBusy, setDeletingBusy] = useState(false);
  const customers = new Map(data.customers.map((c) => [c.id, c]));
  const devices = new Map(data.devices.map((d) => [d.id, d]));
  const collection =
    kind === "customers"
      ? data.customers
      : kind === "devices"
        ? data.devices
        : data.orders;
  const record = detail
    ? collection.find((r) => r.id === params.id)
    : undefined;
  const customer =
    record &&
    ("customerId" in record
      ? customers.get(record.customerId)
      : customers.get(record.id));
  const device =
    record &&
    ("deviceId" in record
      ? devices.get(record.deviceId)
      : kind === "devices"
        ? devices.get(record.id)
        : undefined);
  const orders = record
    ? data.orders.filter((o) =>
        kind === "customers"
          ? o.customerId === record.id
          : kind === "devices"
            ? o.deviceId === record.id
            : o.id === record.id,
      )
    : [];
  const linkedDevices = record
    ? data.devices.filter((d) => d.customerId === record.id)
    : [];
  const order =
    kind === "work-orders" && record
      ? data.orders.find((o) => o.id === record.id)
      : undefined;
  const matching = collection
    .filter((r) => {
      const owner = "customerId" in r ? customers.get(r.customerId) : undefined;
      const unit = "deviceId" in r ? devices.get(r.deviceId) : undefined;
      const relatedDevices =
        kind === "customers"
          ? data.devices.filter((d) => d.customerId === r.id)
          : [];
      const haystack = JSON.stringify([
        r,
        owner,
        unit,
        relatedDevices,
      ]).toLowerCase();
      return (
        query
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .every((word) => haystack.includes(word)) &&
        (!filter ||
          ("status" in r
            ? r.status === filter
            : "category" in r
              ? r.category === filter
              : true))
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(matching.length / 20) - 1),
  );
  const rows = matching.slice(currentPage * 20, currentPage * 20 + 20);
  const href = (type: Kind, id: string) => "/dashboard/" + type + "/" + id;
  const related = (type: Kind, id: string, label: string) => (
    <Link className="font-medium hover:underline" href={href(type, id)}>
      {label}
    </Link>
  );
  const showValue = (label: string, value?: string) => (
    <div key={label}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
        {value || "—"}
      </dd>
    </div>
  );
  async function remove() {
    if (!deleting) return;
    setDeletingBusy(true);
    setActionError("");
    try {
      const repo =
        kind === "customers"
          ? customerRepository
          : kind === "devices"
            ? deviceRepository
            : workOrderRepository;
      await repo.remove(deleting);
      setDeleting(null);
      if (detail) router.push("/dashboard/" + kind);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Could not delete record.",
      );
    } finally {
      setDeletingBusy(false);
    }
  }
  function exportBackup() {
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), ...data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      "repair-records-" + new Date().toISOString().slice(0, 10) + ".json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (loading)
    return <p role="status">Loading {titles[kind].toLowerCase()}…</p>;
  if (error)
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  if (detail && !record)
    return (
      <div className="space-y-4">
        <h1 className="text-xl">Record not found</h1>
        <Link href={"/dashboard/" + kind}>
          Back to {titles[kind].toLowerCase()}
        </Link>
      </div>
    );
  return (
    <div className="space-y-6">
      {detail && (
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          href={"/dashboard/" + kind}
        >
          <ArrowLeft className="size-4" />
          Back to {titles[kind].toLowerCase()}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {record
              ? "name" in record
                ? record.name
                : record.id
              : titles[kind]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {record
              ? record.id + " · Added " + date(record.createdAt)
              : descriptions[kind]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {record ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditor({ kind, id: record.id })}
              >
                Edit {singular[kind]}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setActionError("");
                  setDeleting(record.id);
                }}
              >
                Delete
              </Button>
              {kind === "customers" && (
                <Button
                  onClick={() =>
                    setEditor({
                      kind: "devices",
                      preset: { customerId: record.id },
                    })
                  }
                >
                  <Plus />
                  Add device
                </Button>
              )}
              {kind === "devices" && device && (
                <Button
                  onClick={() =>
                    setEditor({
                      kind: "work-orders",
                      preset: {
                        customerId: device.customerId,
                        deviceId: device.id,
                      },
                    })
                  }
                >
                  <Plus />
                  New work order
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={exportBackup}>
                <Download />
                Export backup
              </Button>
              <Button onClick={() => setEditor({ kind })}>
                <Plus />
                New {singular[kind]}
              </Button>
            </>
          )}
        </div>
      </div>
      {!detail ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Total records", collection.length],
              [
                "Active repairs",
                data.orders.filter((o) => o.status !== "Completed").length,
              ],
              [
                "Completed repairs",
                data.orders.filter((o) => o.status === "Completed").length,
              ],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
              <label className="flex-1 space-y-2 text-sm font-medium">
                Search {titles[kind].toLowerCase()}
                <Input
                  className="mt-2 h-[38px]"
                  placeholder="Name, ID, contact details, model, serial number or notes…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </label>
              {kind !== "customers" && (
                <div className="sm:w-56">
                  <Picker
                    label={kind === "devices" ? "Category" : "Status"}
                    value={filter}
                    options={[
                      { value: "", label: "All" },
                      ...choices(
                        kind === "devices"
                          ? [
                              ...new Set([
                                ...data.catalog
                                  .filter((i) => i.kind === "category")
                                  .map((i) => i.name),
                                ...data.devices.map((d) => d.category),
                              ]),
                            ]
                          : statuses,
                      ),
                    ]}
                    onChange={(v) => {
                      setFilter(v);
                      setPage(0);
                    }}
                  />
                </div>
              )}
              {(query || filter) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setFilter("");
                    setPage(0);
                  }}
                >
                  Clear
                </Button>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            {matching.length} matching {titles[kind].toLowerCase()}
          </p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {!rows.length ? (
                <div className="p-10 text-center">
                  <p className="font-medium">
                    {collection.length
                      ? "No matching records"
                      : "No " + titles[kind].toLowerCase() + " yet"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {collection.length
                      ? "Try another search or clear the filters."
                      : "Create your first " +
                        singular[kind] +
                        " to get started."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      {(kind === "customers"
                        ? [
                            "Customer",
                            "Contact",
                            "Address",
                            "Devices / repairs",
                          ]
                        : kind === "devices"
                          ? ["Device", "Customer", "Model / serial", "Category"]
                          : [
                              "Work order",
                              "Customer / device",
                              "Status",
                              "Due / cost",
                            ]
                      ).map((label) => (
                        <th key={label} className="px-4 py-3 font-medium">
                          {label}
                        </th>
                      ))}
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-4">
                          {related(kind, r.id, "name" in r ? r.name : r.issue)}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.id}
                          </p>
                        </td>
                        {kind === "customers" && "email" in r ? (
                          <>
                            <td className="px-4 py-4">
                              {r.phone
                                ? [r.phoneCountryCode, r.phone]
                                    .filter(Boolean)
                                    .join(" ")
                                : "—"}
                              <p className="text-muted-foreground">{r.email}</p>
                            </td>
                            <td className="px-4 py-4">
                              {[r.street, r.houseNumber, r.postalCode, r.city]
                                .filter(Boolean)
                                .join(" ") || "—"}
                            </td>
                            <td className="px-4 py-4">
                              {
                                data.devices.filter(
                                  (d) => d.customerId === r.id,
                                ).length
                              }{" "}
                              devices ·{" "}
                              {
                                data.orders.filter((o) => o.customerId === r.id)
                                  .length
                              }{" "}
                              repairs
                            </td>
                          </>
                        ) : kind === "devices" && "model" in r ? (
                          <>
                            <td className="px-4 py-4">
                              {related(
                                "customers",
                                r.customerId,
                                customers.get(r.customerId)?.name ??
                                  "Missing customer",
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {r.model}
                              <p className="text-muted-foreground">
                                {r.serialNumber || "No serial recorded"}
                              </p>
                            </td>
                            <td className="px-4 py-4">{r.category}</td>
                          </>
                        ) : "issue" in r ? (
                          <>
                            <td className="px-4 py-4">
                              {related(
                                "customers",
                                r.customerId,
                                customers.get(r.customerId)?.name ??
                                  "Missing customer",
                              )}
                              <p>
                                {related(
                                  "devices",
                                  r.deviceId,
                                  devices.get(r.deviceId)?.name ??
                                    "Missing device",
                                )}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-md bg-muted px-2 py-1">
                                {r.status}
                              </span>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {r.collectedAt
                                  ? "Collected"
                                  : r.paymentStatus || "Unpaid"}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              {date(r.dueDate)}
                              <p className="text-muted-foreground">
                                {money(r.finalCost || r.estimate)}
                              </p>
                            </td>
                          </>
                        ) : null}
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditor({ kind, id: r.id })}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setActionError("");
                                setDeleting(r.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
          {matching.length > 20 && (
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage + 1} of {Math.ceil(matching.length / 20)}
              </span>
              <Button
                variant="outline"
                disabled={(currentPage + 1) * 20 >= matching.length}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        record && (
          <>
            <Card>
              <CardContent className="p-6">
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {customer && (
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Customer
                      </dt>
                      <dd>
                        {related("customers", customer.id, customer.name)}
                      </dd>
                    </div>
                  )}
                  {customer &&
                    showValue(
                      "Phone",
                      customer.phone
                        ? [customer.phoneCountryCode, customer.phone]
                            .filter(Boolean)
                            .join(" ")
                        : "",
                    )}
                  {customer && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd>
                        {customer.email ? (
                          <a
                            className="text-sm hover:underline"
                            href={"mailto:" + customer.email}
                          >
                            {customer.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                  )}
                  {kind === "customers" && customer && (
                    <>
                      {showValue(
                        "Address",
                        [
                          customer.street,
                          customer.houseNumber,
                          customer.postalCode,
                          customer.city,
                          customer.country,
                        ]
                          .filter(Boolean)
                          .join(" "),
                      )}
                      {showValue("Notes", customer.notes)}
                    </>
                  )}
                  {device && (
                    <>
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Device
                        </dt>
                        <dd>{related("devices", device.id, device.name)}</dd>
                      </div>
                      {showValue("Model", device.model)}
                      {showValue("Serial number", device.serialNumber)}
                      {showValue("Category", device.category)}
                      {showValue("Brand", device.brand)}
                      {showValue("Device notes", device.notes)}
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
            {order && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-5 text-lg font-semibold">Repair details</h2>
                  <dl className="grid gap-5 sm:grid-cols-2">
                    {showValue("Status", order.status)}
                    {showValue("Service", order.service)}
                    {showValue("Reported issue", order.issue)}
                    {showValue("Description", order.description)}
                    {showValue("Intake condition", order.intakeCondition)}
                    {showValue("Accessories received", order.accessories)}
                    {showValue("Diagnosis", order.diagnosis)}
                    {showValue("Work performed / parts", order.technicianNotes)}
                    {showValue("Target date", date(order.dueDate))}
                    {showValue("Estimated cost", money(order.estimate))}
                    {showValue("Final cost", money(order.finalCost))}
                    {showValue("Payment", order.paymentStatus || "Unpaid")}
                    {showValue("Collected", date(order.collectedAt))}
                  </dl>
                  <h3 className="mb-3 mt-6 font-medium">Status history</h3>
                  {(
                    order.history ?? [
                      { status: order.status, at: order.updatedAt },
                    ]
                  ).map((entry, i) => (
                    <p key={i} className="py-1 text-sm text-muted-foreground">
                      {new Date(entry.at).toLocaleString()} · {entry.status}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
            {kind === "customers" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Devices</h2>
                  {!linkedDevices.length && (
                    <p className="text-sm text-muted-foreground">
                      No devices yet. Add a device to start a repair.
                    </p>
                  )}
                  {linkedDevices.map((d) => (
                    <div
                      key={d.id}
                      className="flex justify-between border-b py-3 last:border-0"
                    >
                      {related("devices", d.id, d.name)}
                      <span className="text-sm text-muted-foreground">
                        {d.model} · {d.serialNumber || d.id}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {kind !== "work-orders" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Repair history</h2>
                  {!orders.length && (
                    <p className="text-sm text-muted-foreground">
                      No work orders yet.
                    </p>
                  )}
                  {orders
                    .slice()
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((o) => (
                      <div
                        key={o.id}
                        className="flex flex-wrap justify-between gap-2 border-b py-3 last:border-0"
                      >
                        {related("work-orders", o.id, o.id + " · " + o.issue)}
                        <span className="text-sm text-muted-foreground">
                          {o.status} · {date(o.createdAt)}
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </>
        )
      )}
      {editor && (
        <Editor {...editor} data={data} onClose={() => setEditor(null)} />
      )}
      {deleting && (
        <Modal
          title={"Delete " + singular[kind] + "?"}
          onClose={() => {
            if (!deletingBusy) setDeleting(null);
          }}
        >
          <p className="text-sm">Delete {deleting}? This cannot be undone.</p>
          {actionError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {actionError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={deletingBusy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deletingBusy}
              onClick={remove}
            >
              {deletingBusy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
