import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData, samplePixel } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { VhsTrackingSettings } from "@/types/glitch";

export function vhsTracking(
  source: ImageData,
  mask: ImageData,
  settings: VhsTrackingSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const wobble = settings.wobble;
  const tearStrength = settings.tearStrength;

  for (let y = 0; y < height; y++) {
    const wave = Math.sin(y * 0.08 + settings.seed) * wobble;
    const tear = rng() < 0.02 ? (rng() - 0.5) * tearStrength * 2 : 0;
    const shift = Math.round(wave + tear);

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      const rgba = samplePixel(source.data, width, height, x + shift, y);
      result.data[index] = rgba[0];
      result.data[index + 1] = rgba[1];
      result.data[index + 2] = samplePixel(
        source.data,
        width,
        height,
        x - shift * 0.5,
        y
      )[2];
    }
  }

  return result;
}
