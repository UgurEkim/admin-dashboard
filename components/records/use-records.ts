"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getSnapshot } from "@/data/repositories/api";
import type { Snapshot } from "@/data/schemas";
export type Records = Snapshot;
export function useRecords() {
  const [data, setData] = useState<Records>({
    customers: [],
    devices: [],
    orders: [],
    catalog: [],
    settings: { defaultPhoneCountryCode: "+31" },
    sequences: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    try {
      const next = await getSnapshot();
      if (current === generation.current) {
        setData(next);
        setError("");
      }
    } catch (error) {
      if (current === generation.current)
        setError(
          error instanceof Error ? error.message : "Could not load records.",
        );
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const requestGeneration = generation;
    const reload = () => {
      void refresh();
    };
    reload();
    window.addEventListener("repair-admin:repository-change", reload);
    window.addEventListener("focus", reload);
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("repair-admin-records")
        : null;
    if (channel) channel.onmessage = reload;
    return () => {
      requestGeneration.current++;
      window.removeEventListener("repair-admin:repository-change", reload);
      window.removeEventListener("focus", reload);
      channel?.close();
    };
  }, [refresh]);
  return { data, loading, error, refresh };
}
