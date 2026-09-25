import type { Customer } from "../types";
import { repository } from "./api";
const repo = repository<Customer>("customers");
export const { getAll, getById, create, update, remove } = repo;
