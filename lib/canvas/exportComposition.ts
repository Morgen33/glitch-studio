import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { renderLayerStack } from "@/lib/canvas/renderComposition";
import type { GlitchLayer } from "@/types/glitch";

export type ExportFormat = "png" | "jpeg" | "gif";

async function renderComposedCanvas(
  baseImage: HTMLImageElement,
  layers: GlitchLayer[]
): Promise<HTMLCanvasElement> {
  const width = baseImage.naturalWidth;
  const height = baseImage.naturalHeight;
  const visibleLayers = layers.filter((layer) => layer.visible);
  return renderLayerStack(baseImage, visibleLayers, width, height);
}

export async function exportComposition(
  baseImage: HTMLImageElement,
  layers: GlitchLayer[],
  format: ExportFormat = "png"
): Promise<Blob> {
  const composed = await renderComposedCanvas(baseImage, layers);

  if (format === "png") {
    return canvasToBlob(composed, "image/png");
  }

  if (format === "jpeg") {
    return canvasToBlob(composed, "image/jpeg", 0.92);
  }

  return exportCanvasAsGif(composed);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function exportCanvasAsGif(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to read canvas for GIF export");
  }

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  const palette = quantize(data, 256);
  const index = applyPalette(data, palette);
  const gif = GIFEncoder();

  gif.writeFrame(index, width, height, {
    palette,
    delay: 0,
  });
  gif.finish();

  const bytes = gif.bytes();
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createExportFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const extension = format === "jpeg" ? "jpg" : format;
  return `glitch-studio-export-${timestamp}.${extension}`;
}
