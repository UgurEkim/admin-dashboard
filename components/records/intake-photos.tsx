"use client";
import { useState } from "react";
import type { IntakePhoto } from "@/data/types/work-order";
import { Button } from "@/components/ui/button";

async function preparePhoto(file: File): Promise<IntakePhoto> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPEG, PNG or WebP photo.");
  if (file.size > 10_000_000)
    throw new Error("Each source photo must be smaller than 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare this photo.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    if (dataUrl.length > 200_000)
      dataUrl = canvas.toDataURL("image/jpeg", 0.35);
    if (dataUrl.length > 200_000)
      throw new Error("This photo is too detailed. Choose a smaller image.");
    return { id: crypto.randomUUID(), name: file.name, dataUrl };
  } finally {
    bitmap.close();
  }
}

export function IntakePhotos({
  photos,
  onChange,
  onBusy,
}: {
  photos: IntakePhoto[];
  onChange: (photos: IntakePhoto[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-3">
      <label className="block space-y-2 text-sm font-medium">
        Intake photos (optional)
        <input
          className="block w-full text-sm"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || photos.length >= 4}
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (!files.length) return;
            setError("");
            setBusy(true);
            onBusy(true);
            try {
              if (files.length + photos.length > 4)
                throw new Error("You can keep up to four intake photos.");
              const added: IntakePhoto[] = [];
              for (const file of files) added.push(await preparePhoto(file));
              onChange([...photos, ...added]);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Could not read the photos.",
              );
            } finally {
              setBusy(false);
              onBusy(false);
            }
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {busy
          ? "Preparing photos…"
          : "Up to four photos, resized for storage. Saved when you save this work order."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="min-w-0 space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- Local compressed intake attachment. */}
            <img
              className="h-28 w-full rounded-md border object-cover"
              src={photo.dataUrl}
              alt={photo.name}
            />
            <figcaption className="truncate text-xs">{photo.name}</figcaption>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
            >
              Remove photo
            </Button>
          </figure>
        ))}
      </div>
    </div>
  );
}
