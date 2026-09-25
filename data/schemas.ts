import { z } from "zod";

const text = z.string().max(20_000).default("");
const name = z.string().trim().min(1, "Enter a name.").max(300);
const id = z.string().min(1).max(100);
const date = z.union([z.literal(""), z.iso.date()]).default("");
const money = z
  .string()
  .regex(
    /^(?:\d+(?:\.\d{1,2})?)?$/,
    "Enter a non-negative amount with up to two decimals.",
  )
  .default("");
export const customerInput = z
  .object({
    name,
    email: text,
    phone: text,
    phoneCountryCode: z.string().max(6).default("+31"),
    street: text,
    postalCode: text,
    houseNumber: text,
    city: text,
    country: text,
    notes: text,
  })
  .refine(
    (c) => c.phone.trim() || c.email.trim(),
    "Enter a phone number or email address.",
  );
export const deviceInput = z.object({
  customerId: id,
  name,
  category: name,
  model: name,
  serialNumber: text,
  brand: text,
  notes: text,
});
export const statusSchema = z.enum([
  "Waiting",
  "Repairing",
  "Testing",
  "Completed",
]);
const photo = z.object({
  id,
  name,
  dataUrl: z
    .string()
    .max(200_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
});
export const orderInput = z.object({
  customerId: id,
  deviceId: id,
  issue: name,
  status: statusSchema.default("Waiting"),
  description: text,
  diagnosis: text,
  technicianNotes: text,
  service: text,
  serviceId: text,
  intakeCondition: text,
  accessories: text,
  accessCode: text,
  intakePhotos: z.array(photo).max(4).default([]),
  dueDate: date,
  estimate: money,
  finalCost: money,
  paymentStatus: z.enum(["Unpaid", "Deposit paid", "Paid"]).default("Unpaid"),
  collectedAt: date,
});
export const catalogInput = z.object({
  id,
  kind: z.enum(["category", "brand", "model", "service"]),
  name,
  categoryId: text,
  brandId: text,
  modelId: text,
  price: money,
  description: text,
});
export const settingsInput = z.object({
  defaultPhoneCountryCode: z.enum(["+31", "+32", "+49"]).default("+31"),
});
export const customerRecord = customerInput.safeExtend({
  id,
  createdAt: z.iso.datetime(),
});
export const deviceRecord = deviceInput.extend({
  id,
  createdAt: z.iso.datetime(),
});
export const orderRecord = orderInput.extend({
  id,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  history: z
    .array(z.object({ status: statusSchema, at: z.iso.datetime() }))
    .default([]),
});
export const snapshotSchema = z.object({
  customers: z.array(customerRecord),
  devices: z.array(deviceRecord),
  orders: z.array(orderRecord),
  catalog: z.array(catalogInput),
  settings: settingsInput.default({ defaultPhoneCountryCode: "+31" }),
  sequences: z.record(z.string(), z.number().int().nonnegative()).default({}),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
