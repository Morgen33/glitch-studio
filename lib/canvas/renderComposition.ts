import { calculateImageFit } from "@/lib/canvas/drawImageToFit";
import { applyLayerEffect } from "@/lib/effects/registry";
import {
  getCachedLayerCanvas,
  getMaskImageData,
  loadMaskImage,
  setCachedLayerCanvas,
} from "@/lib/canvas/layerCache";
import type { GlitchLayer } from "@/types/glitch";

const BLEND_MODE_MAP: Record<string, GlobalCompositeOperation> = {
  normal: "source-over",
  screen: "screen",
  multiply: "multiply",
  overlay: "overlay",
  difference: "difference",
  lighter: "lighter",
};

async function renderLayerEffectCanvas(
  sourceData: ImageData,
  layer: GlitchLayer,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const cached = getCachedLayerCanvas(layer.id, layer);
  if (cached) {
    return cached;
  }

  const maskImage = await loadMaskImage(layer.maskDataUrl);
  const maskData = getMaskImageData(layer.maskDataUrl, maskImage, width, height);
  const layerResult = applyLayerEffect(sourceData, maskData, layer);

  const layerCanvas = document.createElement("canvas");
  layerCanvas.width = width;
  layerCanvas.height = height;
  const layerCtx = layerCanvas.getContext("2d");

  if (!layerCtx) {
    throw new Error("Unable to create layer context");
  }

  layerCtx.putImageData(layerResult, 0, 0);
  setCachedLayerCanvas(layer.id, layer, layerCanvas);
  return layerCanvas;
}

export async function renderLayerStack(
  baseImage: HTMLImageElement,
  layers: GlitchLayer[],
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create render context");
  }

  ctx.drawImage(baseImage, 0, 0, width, height);

  if (layers.length === 0) {
    return canvas;
  }

  const sourceData = ctx.getImageData(0, 0, width, height);

  const visibleLayers = layers.filter((layer) => layer.visible);
  const layerCanvases = await Promise.all(
    visibleLayers.map((layer) =>
      renderLayerEffectCanvas(sourceData, layer, width, height)
    )
  );

  for (let index = 0; index < visibleLayers.length; index++) {
    const layer = visibleLayers[index];
    const layerCanvas = layerCanvases[index];

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation =
      BLEND_MODE_MAP[layer.blendMode] ?? "source-over";
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();
  }

  return canvas;
}

export function blitCompositionToCanvas(
  ctx: CanvasRenderingContext2D,
  composed: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): void {
  const fit = calculateImageFit(canvasWidth, canvasHeight, imageWidth, imageHeight);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(
    composed,
    fit.offsetX,
    fit.offsetY,
    fit.drawWidth,
    fit.drawHeight
  );
}

export async function renderComposition(
  ctx: CanvasRenderingContext2D,
  baseImage: HTMLImageElement,
  layers: GlitchLayer[],
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  const composed = await renderLayerStack(
    baseImage,
    layers,
    baseImage.naturalWidth,
    baseImage.naturalHeight
  );

  blitCompositionToCanvas(
    ctx,
    composed,
    canvasWidth,
    canvasHeight,
    baseImage.naturalWidth,
    baseImage.naturalHeight
  );
}
