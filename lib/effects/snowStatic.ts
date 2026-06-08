import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import { seededRandom } from "@/lib/utils/random";
import type { SnowStaticSettings } from "@/types/glitch";

export function snowStatic(
  source: ImageData,
  mask: ImageData,
  settings: SnowStaticSettings
): ImageData {
  const result = cloneImageData(source);
  const rng = seededRandom(settings.seed);
  const intensity = settings.intensity / 100;
  const flicker = settings.flicker / 100;

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    if (rng() > intensity) {
      continue;
    }

    const staticValue = Math.round(rng() * 255);
    const flickerMix = rng() * flicker;
    result.data[i] = Math.round(
      staticValue * (1 - flickerMix) + source.data[i] * flickerMix
    );
    result.data[i + 1] = Math.round(
      staticValue * (1 - flickerMix) + source.data[i + 1] * flickerMix
    );
    result.data[i + 2] = Math.round(
      staticValue * (1 - flickerMix) + source.data[i + 2] * flickerMix
    );
  }

  return result;
}
