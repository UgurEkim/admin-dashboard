import { RecordError } from "./record-error";
import type { CatalogItem } from "../data/catalog";

export function validateCatalog(item: CatalogItem, items: CatalogItem[]) {
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
    throw new RecordError("An entry with this name and scope already exists.");
  for (const [field, kind] of [
    ["categoryId", "category"],
    ["brandId", "brand"],
    ["modelId", "model"],
  ] as const)
    if (
      item[field] &&
      !items.some((i) => i.id === item[field] && i.kind === kind)
    )
      throw new RecordError("Select an existing " + kind + ".");
  if (item.kind === "model" && (!item.brandId || !item.categoryId))
    throw new RecordError("Choose a category and brand for the model.");
  const previous = items.find((i) => i.id === item.id);
  if (previous && previous.kind !== item.kind)
    throw new RecordError("An existing entry cannot change kind.");
  if (
    previous &&
    item.kind === "model" &&
    items.some((i) => i.modelId === item.id) &&
    (previous.brandId !== item.brandId ||
      previous.categoryId !== item.categoryId)
  )
    throw new RecordError(
      "Remove model-specific prices before changing its category or brand.",
    );
  const model = items.find((i) => i.id === item.modelId);
  if (
    model &&
    ((item.brandId && model.brandId !== item.brandId) ||
      (item.categoryId && model.categoryId !== item.categoryId))
  )
    throw new RecordError(
      "The selected model does not match this category or brand.",
    );
}
