"use client";

import { useRef } from "react";
import { Button } from "@/components/Button";
import {
  createExportFilename,
  downloadDataUrl,
  exportComposition,
} from "@/lib/canvas/exportComposition";
import { useGlitchStore } from "@/store/useGlitchStore";

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseImage = useGlitchStore((state) => state.baseImage);
  const imageName = useGlitchStore((state) => state.imageName);
  const layers = useGlitchStore((state) => state.layers);
  const loadImage = useGlitchStore((state) => state.loadImage);
  const undo = useGlitchStore((state) => state.undo);
  const redo = useGlitchStore((state) => state.redo);
  const canUndo = useGlitchStore((state) => state.canUndo);
  const canRedo = useGlitchStore((state) => state.canRedo);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await loadImage(file);
    event.target.value = "";
  };

  const handleExport = async () => {
    if (!baseImage) {
      return;
    }

    const dataUrl = await exportComposition(baseImage, layers);
    downloadDataUrl(dataUrl, createExportFilename());
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold tracking-[0.2em] text-zinc-100">
            GLITCH STUDIO
          </h1>
          <p className="text-xs text-zinc-500">
            {imageName ?? "No image loaded"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          disabled={!canUndo()}
          onClick={undo}
          title="Undo"
        >
          Undo
        </Button>
        <Button
          variant="ghost"
          disabled={!canRedo()}
          onClick={redo}
          title="Redo"
        >
          Redo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Upload
        </Button>
        <Button variant="primary" disabled={!baseImage} onClick={handleExport}>
          Export PNG
        </Button>
      </div>
    </header>
  );
}
