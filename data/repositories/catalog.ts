import { readStored, writeStored } from "./storage";

export type CatalogKind = "category" | "brand" | "model" | "service";
export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  name: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  price?: string;
  description?: string;
};
const key = "repair-admin.catalog";
const categories = [
  "Console",
  "Controller",
  "Laptop",
  "Desktop",
  "Handheld",
  "Other",
];
const brands = [
  "Sony",
  "Microsoft",
  "Nintendo",
  "Apple",
  "Samsung",
  "Lenovo",
  "HP",
  "Dell",
  "ASUS",
  "Acer",
  "MSI",
  "Gigabyte",
  "Razer",
  "Valve",
  "Other",
];
const defaults: CatalogItem[] = [
  ...categories.map((name, i) => ({
    id: "category-" + i,
    kind: "category" as const,
    name,
  })),
  ...brands.map((name, i) => ({
    id: "brand-" + i,
    kind: "brand" as const,
    name,
  })),
  ...[
    ["PS4", 0, 0],
    ["PS5", 0, 0],
    ["DualShock 4", 1, 0],
    ["DualSense", 1, 0],
    ["Xbox One", 0, 1],
    ["Xbox Series X", 0, 1],
    ["Xbox Series S", 0, 1],
    ["Xbox Wireless Controller", 1, 1],
    ["Nintendo Switch", 4, 2],
    ["Nintendo Switch OLED", 4, 2],
    ["Nintendo Switch Lite", 4, 2],
    ["Joy-Con", 1, 2],
  ].map(([name, category, brand], i) => ({
    id: "model-" + i,
    kind: "model" as const,
    name: String(name),
    categoryId: "category-" + category,
    brandId: "brand-" + brand,
  })),
  ...[
    "Diagnostics",
    "Maintenance / cleaning",
    "Stick drift",
    "HDMI port",
    "USB / charging port",
    "Screen replacement",
    "Other repair",
  ].map((name, i) => ({
    id: "service-" + i,
    kind: "service" as const,
    name,
    price: "",
  })),
];
export function getAll(): CatalogItem[] {
  return readStored(key, defaults);
}
export function save(input: CatalogItem) {
  const items = getAll();
  const item = { ...input, name: input.name.trim() };
  if (!item.name) throw new Error("Enter a name.");
  if (
    items.some(
      (i) =>
        i.id !== item.id &&
        i.kind === item.kind &&
        i.name.toLowerCase() === item.name.toLowerCase() &&
        (i.categoryId || "") === (item.categoryId || "") &&
        (i.brandId || "") === (item.brandId || "") &&
        (i.modelId || "") === (item.modelId || ""),
    )
  )
    throw new Error("An entry with this name and scope already exists.");
  for (const [field, kind] of [
    ["categoryId", "category"],
    ["brandId", "brand"],
    ["modelId", "model"],
  ] as const)
    if (
      item[field] &&
      !items.some((i) => i.id === item[field] && i.kind === kind)
    )
      throw new Error("Select an existing " + kind + ".");
  if (item.kind === "model" && (!item.brandId || !item.categoryId))
    throw new Error("Choose a category and brand for the model.");
  if (
    item.price &&
    (!/^\d+(\.\d{1,2})?$/.test(item.price) || Number(item.price) < 0)
  )
    throw new Error("Enter a valid price with up to two decimals.");
  if (
    item.kind === "model" &&
    items.some((i) => i.modelId === item.id) &&
    items.some(
      (i) =>
        i.id === item.id &&
        (i.brandId !== item.brandId || i.categoryId !== item.categoryId),
    )
  )
    throw new Error(
      "Remove model-specific prices before changing its category or brand.",
    );
  const model = items.find((i) => i.id === item.modelId);
  if (
    model &&
    ((item.brandId && model.brandId !== item.brandId) ||
      (item.categoryId && model.categoryId !== item.categoryId))
  )
    throw new Error(
      "The selected model does not match this category or brand.",
    );
  writeStored(
    key,
    items.some((i) => i.id === item.id)
      ? items.map((i) => (i.id === item.id ? item : i))
      : [...items, item],
  );
}
export function remove(id: string) {
  const items = getAll();
  if (
    items.some(
      (i) => i.categoryId === id || i.brandId === id || i.modelId === id,
    )
  )
    throw new Error("Remove or update the linked models and prices first.");
  writeStored(
    key,
    items.filter((i) => i.id !== id),
  );
}

// Public pricing projection excludes customer and repair records.
export function publicPriceList(items = getAll()) {
  const name = (id?: string) => items.find((i) => i.id === id)?.name ?? null;
  return {
    version: 1,
    currency: "EUR",
    services: items
      .filter((i) => i.kind === "service")
      .map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description || "",
        category: name(i.categoryId),
        brand: name(i.brandId),
        model: name(i.modelId),
        price: i.price === "" || i.price === undefined ? null : Number(i.price),
      })),
  };
}
