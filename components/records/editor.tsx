"use client";
import { useState, type FormEvent } from "react";
import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
  type WorkOrderStatus,
} from "@/data";
import {
  getDefaultPhoneCountryCode,
  phoneCountryCodes,
} from "@/lib/customer-settings";
import { PostalLookup } from "@/components/address/postal-lookup";
import { Button } from "@/components/ui/button";
import { Modal, Picker, fieldClass } from "./controls";
import type { Records } from "./use-records";

export type Kind = "customers" | "devices" | "work-orders";
export const singular = {
  customers: "customer",
  devices: "device",
  "work-orders": "work order",
};
export const statuses = ["Waiting", "Repairing", "Testing", "Completed"];
export const choices = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

export function Editor({
  kind,
  id,
  preset = {},
  data,
  onClose,
}: {
  kind: Kind;
  id?: string;
  preset?: Record<string, string>;
  data: Records;
  onClose: () => void;
}) {
  const existing =
    kind === "customers"
      ? data.customers.find((c) => c.id === id)
      : kind === "devices"
        ? data.devices.find((d) => d.id === id)
        : data.orders.find((o) => o.id === id);
  const [form, setForm] = useState<Record<string, string>>(() => ({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: getDefaultPhoneCountryCode(),
    country: "Netherlands",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    notes: "",
    customerId: "",
    deviceId: "",
    category: data.catalog.find((i) => i.kind === "category")?.name ?? "",
    brand: "",
    model: "",
    serialNumber: "",
    issue: "",
    status: "Waiting",
    service: "",
    serviceId: "",
    description: "",
    diagnosis: "",
    technicianNotes: "",
    intakeCondition: "",
    accessories: "",
    dueDate: "",
    estimate: "",
    finalCost: "",
    paymentStatus: "Unpaid",
    collectedAt: "",
    ...preset,
    ...Object.fromEntries(
      Object.entries(existing ?? {}).filter(
        ([, value]) => typeof value === "string",
      ),
    ),
  }));
  const catalogOptions = (
    kind: "category" | "brand" | "model",
    current: string,
  ) =>
    choices([
      ...new Set([
        ...data.catalog
          .filter(
            (i) =>
              i.kind === kind &&
              (kind !== "model" ||
                ((!form.category ||
                  data.catalog.find((c) => c.id === i.categoryId)?.name ===
                    form.category) &&
                  (!form.brand ||
                    data.catalog.find((c) => c.id === i.brandId)?.name ===
                      form.brand))),
          )
          .map((i) => i.name),
        ...(current ? [current] : []),
      ]),
    ]);
  const selectedDevice = data.devices.find((d) => d.id === form.deviceId);
  const availableServices = data.catalog.filter(
    (i) =>
      i.kind === "service" &&
      (!i.categoryId ||
        data.catalog.find((c) => c.id === i.categoryId)?.name ===
          selectedDevice?.category) &&
      (!i.brandId ||
        data.catalog.find((c) => c.id === i.brandId)?.name ===
          selectedDevice?.brand) &&
      (!i.modelId ||
        data.catalog.find((c) => c.id === i.modelId)?.name ===
          selectedDevice?.model),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const field = (
    key: string,
    label: string,
    required = false,
    type = "text",
  ) => (
    <label className="block space-y-2 text-sm font-medium" key={key}>
      {label}
      {required && " *"}
      <input
        className={fieldClass}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        required={required}
        value={form[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  const area = (key: string, label: string) => (
    <label className="block space-y-2 text-sm font-medium" key={key}>
      {label}
      <textarea
        rows={3}
        className={fieldClass}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const f = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim()]),
      );
      if (kind === "customers") {
        const input = {
          name: f.name,
          email: f.email,
          phone: f.phone,
          phoneCountryCode: f.phoneCountryCode,
          street: f.street,
          houseNumber: f.houseNumber,
          postalCode: f.postalCode,
          city: f.city,
          country: f.country,
          notes: f.notes,
        };
        if (id) await customerRepository.update(id, input);
        else await customerRepository.create(input);
      } else if (kind === "devices") {
        const input = {
          customerId: f.customerId,
          name: f.name,
          category: f.category,
          brand: f.brand,
          model: f.model,
          serialNumber: f.serialNumber,
          notes: f.notes,
        };
        if (id) await deviceRepository.update(id, input);
        else await deviceRepository.create(input);
      } else {
        const input = {
          customerId: f.customerId,
          deviceId: f.deviceId,
          issue: f.issue,
          status: f.status as WorkOrderStatus,
          description: f.description,
          diagnosis: f.diagnosis,
          technicianNotes: f.technicianNotes,
          service: f.service,
          serviceId: f.serviceId,
          intakeCondition: f.intakeCondition,
          accessories: f.accessories,
          dueDate: f.dueDate,
          estimate: f.estimate,
          finalCost: f.finalCost,
          paymentStatus: f.paymentStatus,
          collectedAt: f.collectedAt,
        };
        if (id) await workOrderRepository.update(id, input);
        else await workOrderRepository.create(input);
      }
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={(id ? "Edit " : "New ") + singular[kind]}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form className="space-y-4" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">
          Fields marked * are required.
        </p>
        {kind === "customers" ? (
          <>
            {field("name", "Full name", true)}
            {field("email", "Email", false, "email")}
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-end gap-3">
              <Picker
                label="Code"
                value={form.phoneCountryCode}
                options={choices([
                  ...new Set([...phoneCountryCodes, form.phoneCountryCode]),
                ])}
                onChange={(v) => set("phoneCountryCode", v)}
              />
              {field("phone", "Phone number", false, "tel")}
            </div>
            <p className="text-xs text-muted-foreground">
              Provide at least one phone number or email address.
            </p>
            <details className="rounded-lg border p-3" open={!!form.street}>
              <summary className="cursor-pointer text-sm font-medium">
                Address (optional)
              </summary>
              <div className="mt-4 space-y-4">
                <PostalLookup
                  postalCode={form.postalCode}
                  houseNumber={form.houseNumber}
                  onChange={(v) => setForm((f) => ({ ...f, ...v }))}
                  onResolved={(v) => setForm((f) => ({ ...f, ...v }))}
                />
                {field("street", "Street")}
                {field("city", "City")}
                {field("country", "Country")}
              </div>
            </details>
            {area("notes", "Customer notes")}
          </>
        ) : (
          <>
            <Picker
              label="Customer *"
              value={form.customerId}
              options={data.customers.map((c) => ({
                value: c.id,
                label: [c.name, c.id, c.email, c.phone]
                  .filter(Boolean)
                  .join(" · "),
              }))}
              onChange={(v) =>
                setForm((f) => ({ ...f, customerId: v, deviceId: "" }))
              }
            />
            {!data.customers.length && (
              <p className="text-sm text-muted-foreground">
                Add a customer on the Customers page first.
              </p>
            )}
            {kind === "devices" ? (
              <>
                {field("name", "Device name", true)}
                <Picker
                  label="Category"
                  value={form.category}
                  options={catalogOptions("category", form.category)}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, category: v, model: "" }))
                  }
                />
                <Picker
                  label="Brand"
                  value={form.brand}
                  options={catalogOptions("brand", form.brand)}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, brand: v, model: "" }))
                  }
                />
                <Picker
                  label="Model *"
                  value={form.model}
                  options={catalogOptions("model", form.model)}
                  onChange={(v) => set("model", v)}
                />
                <p className="text-xs text-muted-foreground">
                  Manage categories, brands and models in Settings → Device
                  catalog.
                </p>
                {field("serialNumber", "Serial number (if available)")}
                {area("notes", "Device notes")}
              </>
            ) : (
              <>
                <Picker
                  label="Device *"
                  value={form.deviceId}
                  disabled={!form.customerId}
                  options={data.devices
                    .filter((d) => d.customerId === form.customerId)
                    .map((d) => ({
                      value: d.id,
                      label: [d.name, d.model, d.serialNumber, d.id]
                        .filter(Boolean)
                        .join(" · "),
                    }))}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      deviceId: v,
                      serviceId: "",
                      service: "",
                      estimate: "",
                    }))
                  }
                />
                {form.customerId &&
                  !data.devices.some(
                    (d) => d.customerId === form.customerId,
                  ) && (
                    <p className="text-sm text-muted-foreground">
                      This customer has no devices. Add one from their customer
                      profile first.
                    </p>
                  )}
                <Picker
                  label="Service"
                  value={form.serviceId || form.service}
                  options={[
                    ...availableServices.map((i) => ({
                      value: i.id,
                      label:
                        i.name +
                        " · " +
                        (i.price ? "€" + i.price : "Quote required") +
                        (i.modelId
                          ? " · " +
                            data.catalog.find((c) => c.id === i.modelId)?.name
                          : ""),
                    })),
                    ...((form.serviceId || form.service) &&
                    !availableServices.some((i) => i.id === form.serviceId)
                      ? [
                          {
                            value: form.serviceId || form.service,
                            label: form.service + " (saved)",
                          },
                        ]
                      : []),
                  ]}
                  onChange={(v) => {
                    const service = data.catalog.find((i) => i.id === v);
                    if (service)
                      setForm((f) => ({
                        ...f,
                        serviceId: service.id,
                        service: service.name,
                        estimate: service.price ?? "",
                      }));
                  }}
                />
                {field("estimate", "Estimated cost (€)", false, "number")}
                <p className="text-xs text-muted-foreground">
                  Selecting a service copies its current price. You can adjust
                  it for this repair; saved estimates stay unchanged when the
                  price list changes.
                </p>
                {field("issue", "Reported issue", true)}
                {area("description", "Issue details")}
                <Picker
                  label="Status *"
                  value={form.status}
                  options={choices(statuses)}
                  onChange={(v) => set("status", v)}
                />
                {field("dueDate", "Target completion date", false, "date")}
                <details className="rounded-lg border p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Intake condition and accessories
                  </summary>
                  <div className="mt-4 space-y-4">
                    {area("intakeCondition", "Condition on arrival")}
                    {area("accessories", "Accessories received")}
                  </div>
                </details>
                <details className="rounded-lg border p-3" open={!!id}>
                  <summary className="cursor-pointer text-sm font-medium">
                    Repair notes and costs
                  </summary>
                  <div className="mt-4 space-y-4">
                    {area("diagnosis", "Diagnosis")}
                    {area("technicianNotes", "Work performed / parts replaced")}
                    {field("finalCost", "Final cost (€)", false, "number")}
                    <Picker
                      label="Payment"
                      value={form.paymentStatus}
                      options={choices(["Unpaid", "Deposit paid", "Paid"])}
                      onChange={(v) => set("paymentStatus", v)}
                    />
                    {field("collectedAt", "Collection date", false, "date")}
                  </div>
                </details>
              </>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving…"
              : id
                ? "Save changes"
                : "Create " + singular[kind]}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
