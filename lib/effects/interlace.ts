import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { InterlaceSettings } from "@/types/glitch";

export function interlace(
  source: ImageData,
  mask: ImageData,
  settings: InterlaceSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const offset = Math.round(settings.lineOffset);
  const blend = settings.intensity / 100;

  for (let y = 0; y < height; y++) {
    const shift = y % 2 === 0 ? offset : -offset;

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      const srcX = Math.max(0, Math.min(width - 1, x + shift));
      const srcIndex = (y * width + srcX) * 4;

      result.data[index] = Math.round(
        source.data[index] * (1 - blend) + source.data[srcIndex] * blend
      );
      result.data[index + 1] = Math.round(
        source.data[index + 1] * (1 - blend) + source.data[srcIndex + 1] * blend
      );
      result.data[index + 2] = Math.round(
        source.data[index + 2] * (1 - blend) + source.data[srcIndex + 2] * blend
      );
    }
  }

  return result;
}
