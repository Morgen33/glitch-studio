import { renderLayerStack } from "@/lib/canvas/renderComposition";
import type { GlitchLayer } from "@/types/glitch";

export async function exportComposition(
  baseImage: HTMLImageElement,
  layers: GlitchLayer[]
): Promise<string> {
  const width = baseImage.naturalWidth;
  const height = baseImage.naturalHeight;
  const visibleLayers = layers.filter((layer) => layer.visible);
  const composed = await renderLayerStack(baseImage, visibleLayers, width, height);

  return composed.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function createExportFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `glitch-studio-export-${timestamp}.png`;
}
