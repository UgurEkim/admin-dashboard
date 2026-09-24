"use client";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  lookupDutchAddress,
  type PostalAddress,
} from "@/lib/address/postal-lookup";
export function PostalLookup({
  postalCode,
  houseNumber,
  onChange,
  onResolved,
}: {
  postalCode: string;
  houseNumber: string;
  onChange: (value: { postalCode?: string; houseNumber?: string }) => void;
  onResolved: (address: PostalAddress) => void;
}) {
  const [status, setStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  async function findAddress() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setStatus("Looking up…");
    try {
      const address = await lookupDutchAddress(
        postalCode,
        houseNumber,
        controller.signal,
      );
      if (!address) setStatus("No address found. You can enter it manually.");
      else {
        onResolved(address);
        setStatus("Address found");
      }
    } catch (error) {
      if (!controller.signal.aborted)
        setStatus(
          error instanceof Error
            ? error.message
            : "Could not look up this address.",
        );
    }
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_0.7fr_auto]">
        <label className="block text-sm font-medium">
          Postal code
          <Input
            className="mt-2"
            placeholder="1012 AB"
            value={postalCode}
            onChange={(event) => onChange({ postalCode: event.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          House number
          <Input
            className="mt-2"
            placeholder="123"
            value={houseNumber}
            onChange={(event) => onChange({ houseNumber: event.target.value })}
          />
        </label>
        <Button
          type="button"
          variant="outline"
          className="mt-auto"
          onClick={findAddress}
        >
          <Search className="size-4" />
          Find address
        </Button>
      </div>
      {status && (
        <p className="text-xs text-muted-foreground" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
