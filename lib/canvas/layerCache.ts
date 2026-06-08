import type { GlitchLayer } from "@/types/glitch";

type LayerCacheEntry = {
  key: string;
  canvas: HTMLCanvasElement;
};

const layerEffectCache = new Map<string, LayerCacheEntry>();
const maskImageDataCache = new Map<string, ImageData>();
const maskImageLoadCache = new Map<string, Promise<HTMLImageElement>>();

function getLayerCacheKey(layer: GlitchLayer): string {
  return `${layer.effectType}|${JSON.stringify(layer.settings)}|${layer.maskDataUrl}`;
}

export function getCachedLayerCanvas(
  layerId: string,
  layer: GlitchLayer
): HTMLCanvasElement | null {
  const entry = layerEffectCache.get(layerId);
  if (!entry) {
    return null;
  }

  const key = getLayerCacheKey(layer);
  return entry.key === key ? entry.canvas : null;
}

export function setCachedLayerCanvas(
  layerId: string,
  layer: GlitchLayer,
  canvas: HTMLCanvasElement
): void {
  layerEffectCache.set(layerId, {
    key: getLayerCacheKey(layer),
    canvas,
  });
}

export function removeLayerFromCache(layerId: string): void {
  layerEffectCache.delete(layerId);
}

export function clearLayerCache(): void {
  layerEffectCache.clear();
  maskImageDataCache.clear();
  maskImageLoadCache.clear();
}

export async function loadMaskImage(maskDataUrl: string): Promise<HTMLImageElement> {
  const cached = maskImageLoadCache.get(maskDataUrl);
  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load mask image"));
    image.src = maskDataUrl;
  });

  maskImageLoadCache.set(maskDataUrl, promise);
  return promise;
}

export function getMaskImageData(
  maskDataUrl: string,
  maskImage: HTMLImageElement,
  width: number,
  height: number
): ImageData {
  const cacheKey = `${maskDataUrl}:${width}x${height}`;
  const cached = maskImageDataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d");

  if (!maskCtx) {
    throw new Error("Unable to create mask context");
  }

  maskCtx.drawImage(maskImage, 0, 0, width, height);
  const imageData = maskCtx.getImageData(0, 0, width, height);
  maskImageDataCache.set(cacheKey, imageData);
  return imageData;
}
