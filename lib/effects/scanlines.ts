import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { ScanlinesSettings } from "@/types/glitch";

export function scanlines(
  source: ImageData,
  mask: ImageData,
  settings: ScanlinesSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const spacing = Math.max(2, Math.round(settings.spacing));
  const darken = settings.intensity / 100;

  for (let y = 0; y < height; y++) {
    if (y % spacing !== 0) {
      continue;
    }

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      result.data[index] = Math.round(result.data[index] * (1 - darken));
      result.data[index + 1] = Math.round(result.data[index + 1] * (1 - darken));
      result.data[index + 2] = Math.round(result.data[index + 2] * (1 - darken));
    }
  }

  return result;
}
