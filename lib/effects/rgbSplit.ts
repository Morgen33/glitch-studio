import { clamp } from "@/lib/canvas/coordinates";
import { getMaskAlpha } from "@/lib/effects/applyMask";
import type { RGBSplitSettings } from "@/types/glitch";

export function rgbSplit(
  source: ImageData,
  mask: ImageData,
  settings: RGBSplitSettings
): ImageData {
  const { width, height } = source;
  const result = new ImageData(
    new Uint8ClampedArray(source.data),
    width,
    height
  );

  const amount = Math.round(settings.amount);
  const angleRad = (settings.angle * Math.PI) / 180;
  const offsetX = Math.round(Math.cos(angleRad) * amount);
  const offsetY = Math.round(Math.sin(angleRad) * amount);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const maskAlpha = getMaskAlpha(mask, index);

      if (maskAlpha <= 0) {
        continue;
      }

      const redX = clamp(x - offsetX, 0, width - 1);
      const redY = clamp(y - offsetY, 0, height - 1);
      const blueX = clamp(x + offsetX, 0, width - 1);
      const blueY = clamp(y + offsetY, 0, height - 1);

      const redIndex = (redY * width + redX) * 4;
      const blueIndex = (blueY * width + blueX) * 4;

      result.data[index] = source.data[redIndex];
      result.data[index + 1] = source.data[index + 1];
      result.data[index + 2] = source.data[blueIndex + 2];
    }
  }

  return result;
}
