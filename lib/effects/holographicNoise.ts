import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { HolographicNoiseSettings } from "@/types/glitch";

export function holographicNoise(
  source: ImageData,
  mask: ImageData,
  settings: HolographicNoiseSettings
): ImageData {
  const result = cloneImageData(source);
  const { width } = source;
  const rng = seededRandom(settings.seed);
  const intensity = settings.intensity / 100;
  const shimmer = settings.shimmer / 100;

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const hue = (x * 0.7 + y * 1.3 + settings.seed) % 360;
    const noise = rng() * intensity;

    const rShift = Math.sin((hue * Math.PI) / 180) * 80 * shimmer;
    const gShift = Math.sin(((hue + 120) * Math.PI) / 180) * 80 * shimmer;
    const bShift = Math.sin(((hue + 240) * Math.PI) / 180) * 80 * shimmer;

    result.data[i] = Math.min(
      255,
      result.data[i] + rShift * noise + noise * 40
    );
    result.data[i + 1] = Math.min(
      255,
      result.data[i + 1] + gShift * noise + noise * 20
    );
    result.data[i + 2] = Math.min(
      255,
      result.data[i + 2] + bShift * noise + noise * 60
    );
  }

  return result;
}
