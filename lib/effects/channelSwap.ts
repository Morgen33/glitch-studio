import { getMaskAlpha } from "@/lib/effects/applyMask";
import { cloneImageData } from "@/lib/effects/shared";
import type { ChannelSwapSettings } from "@/types/glitch";

export function channelSwap(
  source: ImageData,
  mask: ImageData,
  settings: ChannelSwapSettings
): ImageData {
  const result = cloneImageData(source);

  for (let i = 0; i < source.data.length; i += 4) {
    if (getMaskAlpha(mask, i) <= 0) {
      continue;
    }

    const r = source.data[i];
    const g = source.data[i + 1];
    const b = source.data[i + 2];

    switch (settings.mode) {
      case "rb":
        result.data[i] = b;
        result.data[i + 2] = r;
        break;
      case "rg":
        result.data[i] = g;
        result.data[i + 1] = r;
        break;
      case "gb":
        result.data[i + 1] = b;
        result.data[i + 2] = g;
        break;
      case "brg":
        result.data[i] = b;
        result.data[i + 1] = r;
        result.data[i + 2] = g;
        break;
    }
  }

  return result;
}
