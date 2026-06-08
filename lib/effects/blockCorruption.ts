import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { BlockCorruptionSettings } from "@/types/glitch";

export function blockCorruption(
  source: ImageData,
  mask: ImageData,
  settings: BlockCorruptionSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const blockSize = Math.max(4, Math.round(settings.blockSize));
  const density = settings.density / 100;

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      const centerIndex = (by * width + bx) * 4;
      if (getMaskAlpha(mask, centerIndex) <= 0 || rng() > density) {
        continue;
      }

      const srcBx = Math.max(
        0,
        Math.min(width - blockSize, bx + Math.round((rng() - 0.5) * width * 0.3))
      );
      const srcBy = Math.max(
        0,
        Math.min(height - blockSize, by + Math.round((rng() - 0.5) * height * 0.3))
      );

      for (let y = by; y < Math.min(by + blockSize, height); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const index = (y * width + x) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }

          const srcX = srcBx + (x - bx);
          const srcY = srcBy + (y - by);
          const srcIndex = (srcY * width + srcX) * 4;
          result.data[index] = source.data[srcIndex];
          result.data[index + 1] = source.data[srcIndex + 1];
          result.data[index + 2] = source.data[srcIndex + 2];
        }
      }
    }
  }

  return result;
}
