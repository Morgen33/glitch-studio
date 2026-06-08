import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { PosterizeSettings } from "@/types/glitch";

export function posterize(
  source: ImageData,
  mask: ImageData,
  settings: PosterizeSettings
): ImageData {
  const result = cloneImageData(source);
  const levels = Math.max(2, Math.round(settings.levels));
  const step = 255 / (levels - 1);

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    result.data[i] = Math.round(result.data[i] / step) * step;
    result.data[i + 1] = Math.round(result.data[i + 1] / step) * step;
    result.data[i + 2] = Math.round(result.data[i + 2] / step) * step;
  }

  return result;
}
