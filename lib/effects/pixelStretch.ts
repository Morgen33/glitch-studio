import { clamp } from "@/lib/canvas/coordinates";
import { getMaskAlpha } from "@/lib/effects/applyMask";
import { seededRandom } from "@/lib/utils/random";
import type { PixelStretchSettings } from "@/types/glitch";

function copyPixel(
  fromData: Uint8ClampedArray,
  fromIndex: number,
  toData: Uint8ClampedArray,
  toIndex: number
): void {
  toData[toIndex] = fromData[fromIndex];
  toData[toIndex + 1] = fromData[fromIndex + 1];
  toData[toIndex + 2] = fromData[fromIndex + 2];
  toData[toIndex + 3] = fromData[fromIndex + 3];
}

export function pixelStretch(
  source: ImageData,
  mask: ImageData,
  settings: PixelStretchSettings
): ImageData {
  const { width, height } = source;
  const result = new ImageData(
    new Uint8ClampedArray(source.data),
    width,
    height
  );
  const rng = seededRandom(settings.seed);
  const maxStreak = Math.max(2, Math.round(settings.strength));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const maskAlpha = getMaskAlpha(mask, index);

      if (maskAlpha <= 0) {
        continue;
      }

      const streakLength = 1 + Math.floor(rng() * maxStreak);
      let direction = settings.direction;

      if (direction === "random") {
        direction = rng() > 0.5 ? "horizontal" : "vertical";
      }

      for (let step = 0; step < streakLength; step++) {
        let targetX = x;
        let targetY = y;

        if (direction === "horizontal") {
          targetX = x + (rng() > 0.5 ? step : -step);
        } else {
          targetY = y + (rng() > 0.5 ? step : -step);
        }

        targetX = clamp(targetX, 0, width - 1);
        targetY = clamp(targetY, 0, height - 1);

        const targetIndex = (targetY * width + targetX) * 4;
        copyPixel(source.data, index, result.data, targetIndex);
      }
    }
  }

  return result;
}
