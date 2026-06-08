"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import {
  createExportFilename,
  downloadBlob,
  exportComposition,
  type ExportFormat,
} from "@/lib/canvas/exportComposition";
import { useGlitchStore } from "@/store/useGlitchStore";

const EXPORT_OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: "png", label: "PNG" },
  { format: "jpeg", label: "JPG" },
  { format: "gif", label: "GIF" },
];

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async (format: ExportFormat) => {
    if (!baseImage || isExporting) {
      return;
    }

    setIsExporting(true);
    setExportMenuOpen(false);

    try {
      const blob = await exportComposition(baseImage, layers, format);
      downloadBlob(blob, createExportFilename(format));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4">
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

        <div className="relative">
          <Button
            variant="primary"
            disabled={!baseImage || isExporting}
            onClick={() => setExportMenuOpen((open) => !open)}
          >
            {isExporting ? "Exporting..." : "Download"}
          </Button>

          {exportMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
              {EXPORT_OPTIONS.map((option) => (
                <button
                  key={option.format}
                  type="button"
                  onClick={() => void handleExport(option.format)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  Download {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
