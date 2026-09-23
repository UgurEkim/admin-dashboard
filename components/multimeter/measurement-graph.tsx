import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { graphBounds } from "@/lib/multimeter/protocol";
import type { Measurement } from "@/lib/multimeter/types";

interface MeasurementGraphProps {
  measurements: Measurement[];
  graphTitle: string;
  currentUnit: string;
  formatValue: (value: number | null) => string;
}

export function MeasurementGraph({
  measurements,
  graphTitle,
  currentUnit,
  formatValue,
}: MeasurementGraphProps) {
  const graph = useMemo(() => {
    const history = measurements.slice(-120);
    const values = history.flatMap((reading) =>
      reading.value === null ? [] : [reading.value],
    );
    if (!values.length) return null;
    const bounds = graphBounds(values);
    const startTime = Date.parse(history[0].timestamp);
    const duration = Math.max(
      Date.parse(history[history.length - 1].timestamp) - startTime,
      1,
    );
    const xPosition = (reading: Measurement) =>
      125 + ((Date.parse(reading.timestamp) - startTime) / duration) * 835;
    const points = history.map((reading) =>
      reading.value === null
        ? null
        : {
            x: xPosition(reading),
            y:
              30 +
              ((bounds.max - reading.value) / (bounds.max - bounds.min)) * 230,
            id: reading.id,
          },
    );
    // Overloads break the line instead of connecting unrelated readings across the gap.
    let drawing = false;
    const path = points
      .map((point) => {
        if (!point) {
          drawing = false;
          return "";
        }
        const segment = `${drawing ? "L" : "M"}${point.x},${point.y}`;
        drawing = true;
        return segment;
      })
      .join(" ");
    return { bounds, points, path, history, startTime, duration };
  }, [measurements]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Live graph</CardTitle>
          <span className="text-sm text-muted-foreground">
            Latest {Math.min(measurements.length, 120)} samples
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-zinc-300 bg-zinc-200 p-2 text-zinc-950 sm:p-4">
          {!graph ? (
            <div className="flex h-72 items-center justify-center text-center text-sm text-zinc-700">
              {measurements.length
                ? "Waiting for an in-range reading. Overloads are not plotted."
                : "Start the measurement to begin plotting data."}
            </div>
          ) : (
            <div className="w-full">
              <svg
                viewBox="0 0 1000 330"
                className="block h-auto min-h-80 w-full"
                role="img"
                aria-label={`${graphTitle} measurement graph, value in ${currentUnit} against time. Overloads appear as gaps.`}
              >
                <text
                  x="18"
                  y="155"
                  textAnchor="middle"
                  className="fill-zinc-700 text-[14px]"
                  transform="rotate(-90 18 155)"
                >
                  Value ({currentUnit})
                </text>
                {Array.from({ length: 5 }, (_, index) => {
                  const y = 30 + (index / 4) * 230;
                  const value =
                    graph.bounds.max -
                    (index / 4) * (graph.bounds.max - graph.bounds.min);
                  return (
                    <g key={index}>
                      <line
                        x1="125"
                        y1={y}
                        x2="960"
                        y2={y}
                        className="stroke-zinc-300"
                        strokeDasharray="4 6"
                      />
                      <text
                        x="115"
                        y={y + 5}
                        textAnchor="end"
                        className="fill-zinc-700 text-[13px]"
                      >
                        {formatValue(value)}
                      </text>
                    </g>
                  );
                })}
                {Array.from(
                  { length: Math.min(5, graph.history.length) },
                  (_, index) => {
                    const sampleIndex = Math.round(
                      (index /
                        Math.max(Math.min(5, graph.history.length) - 1, 1)) *
                        (graph.history.length - 1),
                    );
                    const x =
                      125 +
                      ((Date.parse(graph.history[sampleIndex].timestamp) -
                        graph.startTime) /
                        graph.duration) *
                        835;
                    return (
                      <g key={index}>
                        <line
                          x1={x}
                          y1="30"
                          x2={x}
                          y2="260"
                          className="stroke-zinc-300"
                          strokeDasharray="4 6"
                        />
                        <text
                          x={x}
                          y="282"
                          textAnchor="middle"
                          className="fill-zinc-700 text-[12px]"
                        >
                          {new Date(
                            graph.history[sampleIndex].timestamp,
                          ).toLocaleTimeString()}
                        </text>
                      </g>
                    );
                  },
                )}
                <path
                  d="M125,30 V260 H960"
                  fill="none"
                  className="stroke-zinc-600"
                  strokeWidth="1.5"
                />
                <path
                  d={graph.path}
                  fill="none"
                  className="stroke-blue-600"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {graph.points.map(
                  (point) =>
                    point && (
                      <circle
                        key={point.id}
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        className="fill-blue-600"
                      />
                    ),
                )}
                <text
                  x="540"
                  y="315"
                  textAnchor="middle"
                  className="fill-zinc-700 text-[14px]"
                >
                  Time
                </text>
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
