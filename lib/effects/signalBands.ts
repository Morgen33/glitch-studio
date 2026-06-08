import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { SignalBandsSettings } from "@/types/glitch";

export function signalBands(
  source: ImageData,
  mask: ImageData,
  settings: SignalBandsSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const bandCount = Math.max(2, Math.round(settings.bandCount));
  const bandHeight = Math.ceil(height / bandCount);
  const shifts = Array.from({ length: bandCount }, () =>
    Math.round((rng() - 0.5) * settings.shiftAmount * 2)
  );

  for (let y = 0; y < height; y++) {
    const band = Math.floor(y / bandHeight);
    const shift = shifts[Math.min(band, bandCount - 1)] ?? 0;

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

  return result;
}
