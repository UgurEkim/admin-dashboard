"use client";
import { useState } from "react";
import type { WorkOrder } from "@/data/types/work-order";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function IntakeView({ order }: { order: WorkOrder }) {
  const [showCode, setShowCode] = useState(false);
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">Intake details</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Device access code / PIN</dt>
            <dd className="mt-1">
              {order.accessCode ? (
                <span className="flex items-center gap-2">
                  <span>{showCode ? order.accessCode : "••••••"}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCode((v) => !v)}
                  >
                    {showCode ? "Hide code" : "Show code"}
                  </Button>
                </span>
              ) : (
                "Not recorded"
              )}
            </dd>
          </div>
        </dl>
        <div>
          <h3 className="mb-3 font-medium">Intake photos</h3>
          {!order.intakePhotos?.length ? (
            <p className="text-sm text-muted-foreground">
              No intake photos recorded.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {order.intakePhotos.map((photo) => (
                <details className="rounded-lg border p-2" key={photo.id}>
                  <summary className="cursor-pointer text-sm">
                    {photo.name} · View photo
                  </summary>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Saved local intake attachment. */}
                  <img
                    className="mt-2 max-h-96 w-full object-contain"
                    src={photo.dataUrl}
                    alt={photo.name}
                  />
                </details>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
