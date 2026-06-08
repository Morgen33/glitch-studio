import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { EdgeBleedSettings } from "@/types/glitch";

export function edgeBleed(
  source: ImageData,
  mask: ImageData,
  settings: EdgeBleedSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const threshold = settings.threshold;
  const distance = Math.max(1, Math.round(settings.bleedDistance));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;

      const gx =
        -source.data[left] +
        source.data[right] -
        source.data[left + 1] +
        source.data[right + 1] -
        source.data[left + 2] +
        source.data[right + 2];
      const gy =
        -source.data[up] +
        source.data[down] -
        source.data[up + 1] +
        source.data[down + 1] -
        source.data[up + 2] +
        source.data[down + 2];
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude < threshold) {
        continue;
      }

      const bleedX = Math.max(0, Math.min(width - 1, x + Math.sign(gx) * distance));
      const bleedY = Math.max(0, Math.min(height - 1, y + Math.sign(gy) * distance));
      const bleedIndex = (bleedY * width + bleedX) * 4;

      result.data[index] = source.data[bleedIndex];
      result.data[index + 1] = source.data[bleedIndex + 1];
      result.data[index + 2] = source.data[bleedIndex + 2];
    }
  }

  return result;
}
