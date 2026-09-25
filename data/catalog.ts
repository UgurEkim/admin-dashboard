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
export const defaultCatalog: CatalogItem[] = [
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

// Public pricing projection excludes customer and repair records.
export function publicPriceList(items: CatalogItem[]) {
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
