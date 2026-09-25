"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Check,
  Clock3,
  Wrench,
  FlaskConical,
  CheckCircle2,
  Pencil,
  ClipboardList,
  Eye,
  Search,
  RotateCcw,
} from "lucide-react";
import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
  type WorkOrderStatus,
} from "@/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal, Picker } from "./controls";
import { Editor, singular, statuses, choices, type Kind } from "./editor";
import { useRecords } from "./use-records";
import { SummaryFilter } from "./summary-filter";
import { IntakeView } from "./intake-view";
import { StatusBadge } from "@/components/status-badge";
import { getWorkOrderStatusStyle } from "@/lib/work-order-status";

const statusIcons = {
  Waiting: Clock3,
  Repairing: Wrench,
  Testing: FlaskConical,
  Completed: CheckCircle2,
};

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
  const [sort, setSort] = useState("newest");
  const [editor, setEditor] = useState<{
    kind: Kind;
    id?: string;
    preset?: Record<string, string>;
  } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState<WorkOrderStatus | null>(null);
  const [statusError, setStatusError] = useState("");
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
      const haystack = JSON.stringify(
        [r, owner, unit, relatedDevices],
        (key, value) =>
          ["accessCode", "dataUrl"].includes(key) ? undefined : value,
      ).toLowerCase();
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
    .sort((a, b) => {
      if (sort === "name" && "name" in a && "name" in b)
        return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (kind === "work-orders" && "issue" in a && "issue" in b) {
        if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
        if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sort === "due")
          return (
            (a.dueDate || "9999").localeCompare(b.dueDate || "9999") ||
            b.createdAt.localeCompare(a.createdAt)
          );
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
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
  async function changeStatus(status: WorkOrderStatus) {
    if (!order || statusBusy || order.status === status) return;
    setStatusBusy(status);
    setStatusError("");
    try {
      await workOrderRepository.update(order.id, { status });
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Could not update status. Please try again.",
      );
    } finally {
      setStatusBusy(null);
    }
  }
  async function remove() {
    if (!deleting || deletingBusy) return;
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
      <div
        className={
          order || !detail
            ? "flex flex-wrap items-center justify-between gap-5 rounded-xl border bg-card p-5 shadow-sm"
            : "flex flex-wrap items-start justify-between gap-4"
        }
      >
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
              {order && (
                <div
                  role="group"
                  aria-label="Work order status"
                  className="grid grid-cols-2 gap-1.5 rounded-xl border bg-muted/30 p-1.5 sm:grid-cols-4"
                >
                  {statuses.map((status) => {
                    const Icon = statusIcons[status];
                    const active = order.status === status;
                    return (
                      <Button
                        key={status}
                        variant="ghost"
                        className={
                          "h-9 gap-2 border px-3 " +
                          getWorkOrderStatusStyle(status).button
                        }
                        aria-pressed={active}
                        aria-disabled={active || !!statusBusy}
                        disabled={!!statusBusy}
                        onClick={() => void changeStatus(status)}
                      >
                        <Icon className="size-4" />
                        <span className="grid">
                          <span
                            className={
                              statusBusy === status
                                ? "invisible col-start-1 row-start-1"
                                : "col-start-1 row-start-1"
                            }
                          >
                            {status}
                          </span>
                          <span
                            aria-hidden={statusBusy !== status}
                            className={
                              statusBusy === status
                                ? "col-start-1 row-start-1"
                                : "invisible col-start-1 row-start-1"
                            }
                          >
                            Saving...
                          </span>
                        </span>
                        <Check
                          className={active ? "size-3.5" : "invisible size-3.5"}
                          aria-hidden="true"
                        />
                      </Button>
                    );
                  })}
                </div>
              )}
              <Button
                variant={order ? "ghost" : "outline"}
                className={
                  order
                    ? "h-9 self-center gap-2 border border-border bg-muted/30 px-3 hover:bg-muted/60"
                    : undefined
                }
                disabled={!!statusBusy}
                onClick={() => setEditor({ kind, id: record.id })}
              >
                {order && <Pencil className="size-4" />}
                Edit {singular[kind]}
              </Button>
              {kind !== "work-orders" && (
                <Button
                  variant="destructive"
                  disabled={!!statusBusy}
                  onClick={() => {
                    setActionError("");
                    setDeleting(record.id);
                  }}
                >
                  Delete
                </Button>
              )}
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
              <Button onClick={() => setEditor({ kind })}>
                <Plus />
                New {singular[kind]}
              </Button>
            </>
          )}
        </div>
      </div>
      {statusError && (
        <p role="alert" className="text-sm text-destructive">
          {statusError}
        </p>
      )}
      {!detail ? (
        <>
          {kind === "work-orders" && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <SummaryFilter
                label="All work orders"
                count={collection.length}
                icon={ClipboardList}
                selected={!filter}
                tone="border-border bg-card text-foreground"
                onClick={() => {
                  setFilter("");
                  setPage(0);
                }}
              />
              {statuses.map((status) => (
                <SummaryFilter
                  key={status}
                  label={status}
                  count={data.orders.filter((o) => o.status === status).length}
                  icon={statusIcons[status]}
                  selected={filter === status}
                  tone={getWorkOrderStatusStyle(status).badge}
                  onClick={() => {
                    setFilter(filter === status ? "" : status);
                    setPage(0);
                  }}
                />
              ))}
            </div>
          )}
          <Card>
            <CardContent
              className={
                kind !== "customers"
                  ? "grid grid-cols-1 items-end gap-3 p-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
                  : "grid grid-cols-1 items-end gap-3 p-4 lg:grid-cols-[repeat(2,minmax(0,1fr))_auto]"
              }
            >
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium">
                <span className="block">
                  Search {titles[kind].toLowerCase()}
                </span>
                <span className="relative block">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="h-[38px] py-0 pl-9 text-sm font-normal"
                    placeholder="Name, ID, contact details, model, serial number or notes…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(0);
                    }}
                  />
                </span>
              </label>
              {kind !== "customers" && (
                <div className="min-w-0">
                  <Picker
                    label={kind === "devices" ? "Category" : "Status"}
                    statusPicker={kind === "work-orders"}
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
              {
                <div className="min-w-0">
                  <Picker
                    label="Sort by"
                    value={sort}
                    options={[
                      { value: "newest", label: "Newest first" },
                      { value: "oldest", label: "Oldest first" },
                      ...(kind === "work-orders"
                        ? [
                            { value: "updated", label: "Recently updated" },
                            { value: "due", label: "Due date" },
                          ]
                        : [{ value: "name", label: "Name A-Z" }]),
                    ]}
                    onChange={(value) => {
                      setSort(value);
                      setPage(0);
                    }}
                  />
                </div>
              }
              {
                <Button
                  variant="ghost"
                  className="h-[38px] gap-2"
                  disabled={!query && !filter}
                  onClick={() => {
                    setQuery("");
                    setFilter("");
                    setPage(0);
                  }}
                >
                  <RotateCcw className="size-4" /> Clear
                </Button>
              }
            </CardContent>
          </Card>
          <p
            role="status"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {matching.length ? currentPage * 20 + 1 : 0}–
            {Math.min((currentPage + 1) * 20, matching.length)} of{" "}
            {matching.length} {titles[kind].toLowerCase()}
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
                  {
                    <Button
                      className="mt-5 h-9 gap-2"
                      variant="outline"
                      onClick={() => {
                        if (collection.length) {
                          setQuery("");
                          setFilter("");
                          setPage(0);
                        } else setEditor({ kind });
                      }}
                    >
                      {collection.length ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      {collection.length
                        ? "Clear filters"
                        : "New " + singular[kind]}
                    </Button>
                  }
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
                        <th
                          scope="col"
                          key={label}
                          className="px-4 py-3 text-xs font-medium text-muted-foreground"
                        >
                          {label}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="w-40 px-4 py-3 text-xs font-medium text-muted-foreground"
                      >
                        Actions
                      </th>
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
                              <StatusBadge status={r.status} />
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
                            {
                              <Button
                                nativeButton={false}
                                render={<Link href={href(kind, r.id)} />}
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-2 border bg-muted/30 px-3"
                                aria-label={"Open " + r.id}
                              >
                                <Eye className="size-4" />
                                Open
                              </Button>
                            }
                            <Button
                              variant="ghost"
                              className="h-9 gap-2 border bg-muted/30 px-3"
                              aria-label={"Edit " + r.id}
                              size="sm"
                              onClick={() => setEditor({ kind, id: r.id })}
                            >
                              <Pencil className="size-4" /> Edit
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
            {order && <IntakeView key={order.id} order={order} />}
            {order && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-5 text-lg font-semibold">Repair details</h2>
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Status</dt>
                      <dd className="mt-1">
                        <StatusBadge status={order.status} />
                      </dd>
                    </div>
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
                      {new Date(entry.at).toLocaleString()} ·{" "}
                      <StatusBadge status={entry.status} />
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
                          <StatusBadge status={o.status} /> ·{" "}
                          {date(o.createdAt)}
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
        <Editor
          {...editor}
          data={data}
          onClose={() => setEditor(null)}
          onDeleted={() => {
            if (detail) router.push("/dashboard/work-orders");
          }}
        />
      )}
      {deleting && (
        <Modal
          title={"Delete " + singular[kind] + "?"}
          onClose={() => {
            if (!deletingBusy) setDeleting(null);
          }}
        >
          <p className="text-sm">
            Are you sure you want to delete{" "}
            {record && "name" in record ? record.name : singular[kind]} (
            {deleting})? This cannot be undone.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {kind === "customers"
              ? "Customers with linked devices or work orders cannot be deleted."
              : "Devices with linked work orders cannot be deleted."}
          </p>
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
