export function isMaskEmpty(mask: ImageData): boolean {
  for (let i = 3; i < mask.data.length; i += 4) {
    if (mask.data[i] > 10) {
      return false;
    }
  }
  return true;
}

export function isMaskCanvasEmpty(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return true;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return isMaskEmpty(imageData);
}

export function getMaskAlpha(mask: ImageData, index: number): number {
  return mask.data[index + 3] / 255;
}

export function blendWithMask(
  source: ImageData,
  effected: ImageData,
  mask: ImageData
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(source.data),
    source.width,
    source.height
  );

  for (let i = 0; i < source.data.length; i += 4) {
    const alpha = getMaskAlpha(mask, i);
    if (alpha <= 0) {
      continue;
    }

    result.data[i] = Math.round(
      source.data[i] * (1 - alpha) + effected.data[i] * alpha
    );
    result.data[i + 1] = Math.round(
      source.data[i + 1] * (1 - alpha) + effected.data[i + 1] * alpha
    );
    result.data[i + 2] = Math.round(
      source.data[i + 2] * (1 - alpha) + effected.data[i + 2] * alpha
    );
    result.data[i + 3] = source.data[i + 3];
  }

  return result;
}
