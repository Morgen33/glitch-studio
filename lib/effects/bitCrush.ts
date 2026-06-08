import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { BitCrushSettings } from "@/types/glitch";

export function bitCrush(
  source: ImageData,
  mask: ImageData,
  settings: BitCrushSettings
): ImageData {
  const result = cloneImageData(source);
  const bits = Math.max(1, Math.min(8, Math.round(settings.bitDepth)));
  const step = Math.pow(2, 8 - bits);

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    result.data[i] = Math.floor(result.data[i] / step) * step;
    result.data[i + 1] = Math.floor(result.data[i + 1] / step) * step;
    result.data[i + 2] = Math.floor(result.data[i + 2] / step) * step;
  }

  return result;
}
