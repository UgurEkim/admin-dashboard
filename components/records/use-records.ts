"use client";
import { useEffect, useState, useCallback } from "react";
import {
  getAll as getCatalog,
  type CatalogItem,
} from "@/data/repositories/catalog";
import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
  type Customer,
  type Device,
  type WorkOrder,
} from "@/data";

export type Records = {
  customers: Customer[];
  devices: Device[];
  orders: WorkOrder[];
  catalog: CatalogItem[];
};
export function useRecords() {
  const [data, setData] = useState<Records>({
    customers: [],
    devices: [],
    orders: [],
    catalog: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const [customers, devices, orders] = await Promise.all([
        customerRepository.getAll(),
        deviceRepository.getAll(),
        workOrderRepository.getAll(),
      ]);
      setData({ customers, devices, orders, catalog: getCatalog() });
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Hydrate from browser storage after mount; it is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const reload = () => {
      void refresh();
    };
    window.addEventListener("storage", reload);
    window.addEventListener("repair-admin:repository-change", reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("repair-admin:repository-change", reload);
    };
  }, [refresh]);
  return { data, loading, error, refresh };
}
