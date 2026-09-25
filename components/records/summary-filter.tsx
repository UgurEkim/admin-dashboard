import type { LucideIcon } from "lucide-react";

/** A fixed-size summary that also filters the record list. */
export function SummaryFilter({
  label,
  count,
  icon: Icon,
  selected,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  icon: LucideIcon;
  selected: boolean;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        "flex min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        tone +
        (selected
          ? " ring-1 ring-current"
          : " hover:brightness-95 dark:hover:brightness-125")
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-xs font-medium">{label}</span>
        <span className="mt-1 block text-2xl font-semibold tabular-nums">
          {count}
        </span>
      </span>
    </button>
  );
}
