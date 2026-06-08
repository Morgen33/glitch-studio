import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData, hslToRgb, rgbToHsl } from "@/lib/effects/shared";
import type { ColorShiftSettings } from "@/types/glitch";

export function colorShift(
  source: ImageData,
  mask: ImageData,
  settings: ColorShiftSettings
): ImageData {
  const result = cloneImageData(source);
  const hueShift = settings.hueShift;
  const satMult = settings.saturation / 100;

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    const [h, s, l] = rgbToHsl(
      source.data[i],
      source.data[i + 1],
      source.data[i + 2]
    );
    const [r, g, b] = hslToRgb((h + hueShift + 360) % 360, Math.min(1, s * satMult), l);
    result.data[i] = r;
    result.data[i + 1] = g;
    result.data[i + 2] = b;
  }

  return result;
}
