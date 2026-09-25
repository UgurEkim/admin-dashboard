import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalDb = globalThis as unknown as { repairDb?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("Configure DATABASE_URL before using the database.");
  return (globalDb.repairDb ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  }));
}
