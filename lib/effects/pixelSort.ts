import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { PixelSortSettings } from "@/types/glitch";

function brightness(data: Uint8ClampedArray, index: number): number {
  return (
    data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
  );
}

export function pixelSort(
  source: ImageData,
  mask: ImageData,
  settings: PixelSortSettings
): ImageData {
  const result = cloneImageData(source);
  const { width, height } = source;
  const rng = seededRandom(settings.seed);
  const streakLength = Math.max(4, Math.round(settings.streakLength));
  const threshold = settings.threshold;

  if (settings.direction === "horizontal") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x += streakLength) {
        const end = Math.min(x + streakLength, width);
        const pixels: { index: number; rgba: number[]; bright: number }[] = [];

        for (let px = x; px < end; px++) {
          const index = (y * width + px) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }
          if (brightness(source.data, index) < threshold && rng() > 0.3) {
            continue;
          }

          pixels.push({
            index,
            rgba: [
              source.data[index],
              source.data[index + 1],
              source.data[index + 2],
              source.data[index + 3],
            ],
            bright: brightness(source.data, index),
          });
        }

        pixels.sort((a, b) => a.bright - b.bright);
        let offset = 0;
        for (let px = x; px < end; px++) {
          const index = (y * width + px) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }
          const pixel = pixels[offset];
          if (!pixel) {
            break;
          }
          result.data[index] = pixel.rgba[0];
          result.data[index + 1] = pixel.rgba[1];
          result.data[index + 2] = pixel.rgba[2];
          offset++;
        }
      }
    }
  } else {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y += streakLength) {
        const end = Math.min(y + streakLength, height);
        const pixels: { index: number; rgba: number[]; bright: number }[] = [];

        for (let py = y; py < end; py++) {
          const index = (py * width + x) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }
          if (brightness(source.data, index) < threshold && rng() > 0.3) {
            continue;
          }

          pixels.push({
            index,
            rgba: [
              source.data[index],
              source.data[index + 1],
              source.data[index + 2],
              source.data[index + 3],
            ],
            bright: brightness(source.data, index),
          });
        }

        pixels.sort((a, b) => a.bright - b.bright);
        let offset = 0;
        for (let py = y; py < end; py++) {
          const index = (py * width + x) * 4;
          if (getMaskAlpha(mask, index) <= 0) {
            continue;
          }
          const pixel = pixels[offset];
          if (!pixel) {
            break;
          }
          result.data[index] = pixel.rgba[0];
          result.data[index + 1] = pixel.rgba[1];
          result.data[index + 2] = pixel.rgba[2];
          offset++;
        }
      }
    }
  }

  return result;
}
