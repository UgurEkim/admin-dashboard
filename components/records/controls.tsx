"use client";
import {
  getWorkOrderStatusStyle,
  workOrderStatuses,
} from "@/lib/work-order-status";
import type { WorkOrderStatus } from "@/data";

import { useId, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import { X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const fieldClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-card p-6 text-card-foreground shadow-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close dialog"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type Choice = { value: string; label: string };

// Base UI owns keyboard navigation, focus and selection; popups use app theme tokens.
export function Picker({
  label,
  value,
  options,
  onChange,
  disabled = false,
  statusPicker = false,
}: {
  label: string;
  value: string;
  options: Choice[];
  onChange: (value: string) => void;
  disabled?: boolean;
  statusPicker?: boolean;
}) {
  const id = useId();
  const tone = (value: string) =>
    statusPicker && workOrderStatuses.includes(value as WorkOrderStatus)
      ? getWorkOrderStatusStyle(value as WorkOrderStatus).badge
      : "";
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Combobox.Root
        items={options}
        value={options.find((o) => o.value === value) ?? null}
        onValueChange={(item) => onChange(item?.value ?? "")}
        disabled={disabled}
        isItemEqualToValue={(a, b) => a.value === b.value}
      >
        <div className="relative">
          <Combobox.Input
            id={id}
            placeholder="Type to search…"
            className={fieldClass + " h-[38px] py-0 pr-9 " + tone(value)}
          />
          <Combobox.Trigger
            aria-label={"Open " + label}
            className="absolute inset-y-0 right-0 px-2"
          >
            <ChevronsUpDown className="size-4" />
          </Combobox.Trigger>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} className="z-[60]">
            <Combobox.Popup className="max-h-64 w-[var(--anchor-width)] overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
              <Combobox.Empty className="p-3 text-sm text-muted-foreground">
                No matches found.
              </Combobox.Empty>
              <Combobox.List>
                {(item: Choice) => (
                  <Combobox.Item
                    key={item.value}
                    value={item}
                    className={
                      "cursor-default rounded-md px-3 py-2 text-sm data-highlighted:bg-accent data-selected:font-semibold " +
                      tone(item.value)
                    }
                  >
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
