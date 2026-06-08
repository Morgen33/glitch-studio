"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateImageFit } from "@/lib/canvas/drawImageToFit";
import {
  blitCompositionToCanvas,
  renderLayerStack,
} from "@/lib/canvas/renderComposition";
import { displayToImageCoords } from "@/lib/canvas/coordinates";
import { useGlitchStore } from "@/store/useGlitchStore";

export function CanvasWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderGenerationRef = useRef(0);

  const baseImage = useGlitchStore((state) => state.baseImage);
  const imageWidth = useGlitchStore((state) => state.imageWidth);
  const imageHeight = useGlitchStore((state) => state.imageHeight);
  const layers = useGlitchStore((state) => state.layers);
  const activeTool = useGlitchStore((state) => state.activeTool);
  const brushSize = useGlitchStore((state) => state.brushSize);
  const maskOpacity = useGlitchStore((state) => state.maskOpacity);
  const setMaskCanvasRef = useGlitchStore((state) => state.setMaskCanvasRef);
  const pushHistory = useGlitchStore((state) => state.pushHistory);
  const maskRevision = useGlitchStore((state) => state.maskRevision);

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const isPaintingRef = useRef(false);
  const didStrokeRef = useRef(false);

  useEffect(() => {
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement("canvas");
    }

    if (baseImage) {
      maskCanvasRef.current.width = imageWidth;
      maskCanvasRef.current.height = imageHeight;
      const ctx = maskCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, imageWidth, imageHeight);
    }

    setMaskCanvasRef(maskCanvasRef.current);

    return () => {
      setMaskCanvasRef(null);
    };
  }, [baseImage, imageWidth, imageHeight, setMaskCanvasRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      setCanvasSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const getFitInfo = useCallback(() => {
    if (!baseImage) {
      return null;
    }

    return calculateImageFit(
      canvasSize.width,
      canvasSize.height,
      baseImage.naturalWidth,
      baseImage.naturalHeight
    );
  }, [baseImage, canvasSize.height, canvasSize.width]);

  const drawMaskOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const fit = getFitInfo();

    if (!overlayCanvas || !maskCanvas || !fit || !baseImage) {
      return;
    }

    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    ctx.save();
    ctx.globalAlpha = maskOpacity;
    ctx.drawImage(
      maskCanvas,
      fit.offsetX,
      fit.offsetY,
      fit.drawWidth,
      fit.drawHeight
    );
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
    ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    ctx.restore();

    if (cursor) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.arc(cursor.x, cursor.y, (brushSize * fit.scale) / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [baseImage, brushSize, cursor, getFitInfo, maskOpacity]);

  const scheduleCompositionRender = useCallback(() => {
    const generation = ++renderGenerationRef.current;

    requestAnimationFrame(() => {
      void (async () => {
        if (generation !== renderGenerationRef.current) {
          return;
        }

        const mainCanvas = mainCanvasRef.current;
        if (!mainCanvas || !baseImage || canvasSize.width === 0) {
          return;
        }

        if (
          mainCanvas.width !== canvasSize.width ||
          mainCanvas.height !== canvasSize.height
        ) {
          mainCanvas.width = canvasSize.width;
          mainCanvas.height = canvasSize.height;
        }

        const composed = await renderLayerStack(
          baseImage,
          layers,
          baseImage.naturalWidth,
          baseImage.naturalHeight
        );

        if (generation !== renderGenerationRef.current) {
          return;
        }

        const ctx = mainCanvas.getContext("2d");
        if (!ctx) {
          return;
        }

        blitCompositionToCanvas(
          ctx,
          composed,
          mainCanvas.width,
          mainCanvas.height,
          baseImage.naturalWidth,
          baseImage.naturalHeight
        );
      })();
    });
  }, [baseImage, canvasSize.height, canvasSize.width, layers]);

  useEffect(() => {
    scheduleCompositionRender();
  }, [scheduleCompositionRender]);

  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || canvasSize.width === 0) {
      return;
    }

    if (
      overlayCanvas.width !== canvasSize.width ||
      overlayCanvas.height !== canvasSize.height
    ) {
      overlayCanvas.width = canvasSize.width;
      overlayCanvas.height = canvasSize.height;
    }

    drawMaskOverlay();
  }, [
    canvasSize.height,
    canvasSize.width,
    drawMaskOverlay,
    maskRevision,
    maskOpacity,
    cursor,
    brushSize,
  ]);

  const paintAt = useCallback(
    (displayX: number, displayY: number) => {
      const maskCanvas = maskCanvasRef.current;
      const fit = getFitInfo();

      if (!maskCanvas || !fit || !baseImage) {
        return;
      }

      const imageCoords = displayToImageCoords(displayX, displayY, fit);
      if (!imageCoords) {
        return;
      }

      const ctx = maskCanvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const radius = brushSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(imageCoords.x, imageCoords.y, radius, 0, Math.PI * 2);

      if (activeTool === "brush") {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fill();
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fill();
      }

      ctx.restore();
      didStrokeRef.current = true;
      drawMaskOverlay();
    },
    [activeTool, baseImage, brushSize, drawMaskOverlay, getFitInfo]
  );

  const getPointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!baseImage) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    isPaintingRef.current = true;
    didStrokeRef.current = false;
    pushHistory();

    const position = getPointerPosition(event);
    if (!position) {
      return;
    }

    paintAt(position.x, position.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const position = getPointerPosition(event);
    if (!position) {
      return;
    }

    setCursor(position);

    if (!isPaintingRef.current) {
      return;
    }

    paintAt(position.x, position.y);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isPaintingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    setCursor(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,_#1a1a22_0%,_#09090b_70%)]"
    >
      {!baseImage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 px-8 py-10 text-center">
            <p className="text-lg font-medium text-zinc-200">Upload an image</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Paint a mask over the area you want to glitch, then apply an effect
              as a non-destructive layer.
            </p>
          </div>
        </div>
      )}

      <canvas
        ref={mainCanvasRef}
        className="absolute inset-0 h-full w-full"
      />
      <canvas
        ref={overlayCanvasRef}
        className={[
          "absolute inset-0 h-full w-full",
          baseImage ? "cursor-none" : "pointer-events-none",
        ].join(" ")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
}
