import type { ImageFitInfo } from "@/types/glitch";

export function displayToImageCoords(
  displayX: number,
  displayY: number,
  fit: ImageFitInfo
): { x: number; y: number } | null {
  const { drawWidth, drawHeight, offsetX, offsetY, scale } = fit;

  if (
    displayX < offsetX ||
    displayY < offsetY ||
    displayX > offsetX + drawWidth ||
    displayY > offsetY + drawHeight
  ) {
    return null;
  }

  return {
    x: (displayX - offsetX) / scale,
    y: (displayY - offsetY) / scale,
  };
}

export function imageToDisplayCoords(
  imageX: number,
  imageY: number,
  fit: ImageFitInfo
): { x: number; y: number } {
  return {
    x: fit.offsetX + imageX * fit.scale,
    y: fit.offsetY + imageY * fit.scale,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
