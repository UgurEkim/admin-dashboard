import "server-only";
import { db } from "./db";
import { catalogInput } from "../data/schemas";
import { publicPriceList } from "../data/catalog";

export async function getPublicPricing() {
  // Query only catalog data; customer records and device access codes never enter this path.
  const items = await db().catalogItem.findMany({ orderBy: { name: "asc" } });
  return publicPriceList(items.map((item) => catalogInput.parse(item)));
}
