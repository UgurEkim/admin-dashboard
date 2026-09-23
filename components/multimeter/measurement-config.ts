import type { MeasurementType } from "@/lib/multimeter/types";
import type { ReactNode } from "react";
import { Timer, Thermometer, Waves, CircuitBoard } from "lucide-react";
import {
  ContinuityIcon,
  CurrentIcon,
  DiodeIcon,
  type MeasurementModeIconProps,
  ResistanceIcon,
  VoltageIcon,
} from "./measurement-icons";

export const measurementIcons: Record<
  MeasurementType,
  (props: MeasurementModeIconProps) => ReactNode
> = {
  Voltage: VoltageIcon,
  Resistance: ResistanceIcon,
  Current: CurrentIcon,
  Continuity: ContinuityIcon,
  Diode: DiodeIcon,
  Capacitance: CircuitBoard,
  Frequency: Waves,
  Period: Timer,
  Temperature: Thermometer,
};
