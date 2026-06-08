import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { DigitalNoiseSettings } from "@/types/glitch";

export function digitalNoise(
  source: ImageData,
  mask: ImageData,
  settings: DigitalNoiseSettings
): ImageData {
  const result = cloneImageData(source);
  const rng = seededRandom(settings.seed);
  const amount = settings.intensity / 100;
  const grain = Math.max(1, Math.round(settings.grainSize));

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    if (rng() > amount) {
      continue;
    }

    const noise = (rng() - 0.5) * 255 * amount;
    result.data[i] = Math.max(0, Math.min(255, result.data[i] + noise));
    result.data[i + 1] = Math.max(
      0,
      Math.min(255, result.data[i + 1] + noise * (grain > 2 ? 0.7 : 1))
    );
    result.data[i + 2] = Math.max(
      0,
      Math.min(255, result.data[i + 2] - noise * 0.5)
    );
  }

  return result;
}
