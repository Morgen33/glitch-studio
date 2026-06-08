import type { ImageFitInfo } from "@/types/glitch";

export function calculateImageFit(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageFitInfo {
  if (imageWidth <= 0 || imageHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return {
      drawWidth: 0,
      drawHeight: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };
  }

  const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
    scale,
  };
}

export function drawImageToFit(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageFitInfo {
  const fit = calculateImageFit(canvasWidth, canvasHeight, imageWidth, imageHeight);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(image, fit.offsetX, fit.offsetY, fit.drawWidth, fit.drawHeight);
  return fit;
}
