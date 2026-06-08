import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { DigitalDecaySettings } from "@/types/glitch";

export function digitalDecay(
  source: ImageData,
  mask: ImageData,
  settings: DigitalDecaySettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const blockSize = Math.max(4, Math.round(settings.blockSize));
  const corruption = settings.corruption / 100;

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      const centerIndex = (by * width + bx) * 4;
      if (getMaskAlpha(mask, centerIndex) <= 0) {
        continue;
      }

      if (rng() > corruption) {
        continue;
      }

      const offsetX = Math.round((rng() - 0.5) * blockSize * 3);
      const offsetY = Math.round((rng() - 0.5) * blockSize * 3);
      const desaturate = rng() * 0.6;

      for (let y = by; y < Math.min(by + blockSize, height); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const index = (y * width + x) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }

          const srcX = Math.max(0, Math.min(width - 1, x + offsetX));
          const srcY = Math.max(0, Math.min(height - 1, y + offsetY));
          const srcIndex = (srcY * width + srcX) * 4;
          const gray =
            source.data[srcIndex] * 0.3 +
            source.data[srcIndex + 1] * 0.59 +
            source.data[srcIndex + 2] * 0.11;

          result.data[index] = Math.round(
            source.data[srcIndex] * (1 - desaturate) + gray * desaturate
          );
          result.data[index + 1] = Math.round(
            source.data[srcIndex + 1] * (1 - desaturate) + gray * desaturate
          );
          result.data[index + 2] = Math.round(
            source.data[srcIndex + 2] * (1 - desaturate) + gray * desaturate
          );
        }
      }
    }
  }

  return result;
}
