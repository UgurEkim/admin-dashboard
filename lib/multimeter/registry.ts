import type { MultimeterDefinition } from "./adapter";
import { owonXdm1041 } from "./owon";

// Add a new tested adapter here. The UI discovers its modes, ranges and settings.
export const multimeterAdapters: readonly MultimeterDefinition[] = [
  owonXdm1041,
];

export function getMultimeterDefinition(id: string): MultimeterDefinition {
  const definition = multimeterAdapters.find((adapter) => adapter.id === id);
  if (!definition) throw new Error(`Unknown multimeter adapter: ${id}`);
  return definition;
}
