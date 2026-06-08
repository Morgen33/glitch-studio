import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData, samplePixel } from "@/lib/effects/shared";
import type { WaveDistortSettings } from "@/types/glitch";

export function waveDistort(
  source: ImageData,
  mask: ImageData,
  settings: WaveDistortSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const amplitude = settings.amplitude;
  const frequency = settings.frequency / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      let sampleX = x;
      let sampleY = y;

      if (settings.direction === "horizontal") {
        sampleX = x + Math.sin(y * frequency) * amplitude;
      } else {
        sampleY = y + Math.sin(x * frequency) * amplitude;
      }

      const rgba = samplePixel(source.data, width, height, sampleX, sampleY);
      result.data[index] = rgba[0];
      result.data[index + 1] = rgba[1];
      result.data[index + 2] = rgba[2];
    }
  }

  return result;
}
