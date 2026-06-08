import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { SliceShiftSettings } from "@/types/glitch";

export function sliceShift(
  source: ImageData,
  mask: ImageData,
  settings: SliceShiftSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const sliceHeight = Math.max(2, Math.round(settings.sliceHeight));
  const maxShift = Math.round(settings.maxShift);

  for (let sliceY = 0; sliceY < height; sliceY += sliceHeight) {
    const shift = Math.round((rng() - 0.5) * maxShift * 2);
    const endY = Math.min(sliceY + sliceHeight, height);

    for (let y = sliceY; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (getMaskAlpha(mask, index) <= 0) {
          continue;
        }

        const srcX = Math.max(0, Math.min(width - 1, x + shift));
        const srcIndex = (y * width + srcX) * 4;
        result.data[index] = source.data[srcIndex];
        result.data[index + 1] = source.data[srcIndex + 1];
        result.data[index + 2] = source.data[srcIndex + 2];
      }
    }
  }

  return result;
}
