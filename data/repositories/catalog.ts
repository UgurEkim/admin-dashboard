import { getSnapshot, request } from "./api";
import type { CatalogItem } from "../catalog";
export type { CatalogItem, CatalogKind } from "../catalog";
export { publicPriceList } from "../catalog";
export async function getAll() {
  return (await getSnapshot()).catalog;
}
export const save = (data: CatalogItem) =>
  request<CatalogItem>({ action: "save", collection: "catalog", data });
export const remove = (id: string) =>
  request<boolean>({ action: "delete", collection: "catalog", id });
