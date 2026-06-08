import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { ChromaticBlurSettings } from "@/types/glitch";

function blurChannel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  channel: number,
  radius: number
): number[] {
  const output = new Array(width * height).fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;

      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const sx = Math.max(0, Math.min(width - 1, x + ox));
          const sy = Math.max(0, Math.min(height - 1, y + oy));
          sum += data[(sy * width + sx) * 4 + channel];
          count++;
        }
      }

      output[y * width + x] = sum / count;
    }
  }

  return output;
}

export function chromaticBlur(
  source: ImageData,
  mask: ImageData,
  settings: ChromaticBlurSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const radius = Math.max(1, Math.round(settings.blurRadius));
  const offset = Math.round(settings.channelOffset);

  const redBlur = blurChannel(source.data, width, height, 0, radius);
  const greenBlur = blurChannel(source.data, width, height, 1, radius);
  const blueBlur = blurChannel(source.data, width, height, 2, radius);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (getMaskAlpha(mask, index) <= 0) {
        continue;
      }

      const redX = Math.max(0, Math.min(width - 1, x - offset));
      const blueX = Math.max(0, Math.min(width - 1, x + offset));
      const pixel = y * width + x;

      result.data[index] = redBlur[y * width + redX];
      result.data[index + 1] = greenBlur[pixel];
      result.data[index + 2] = blueBlur[y * width + blueX];
    }
  }

  return result;
}
