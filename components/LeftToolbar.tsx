"use client";

import { Button } from "@/components/Button";
import { SliderControl } from "@/components/SliderControl";
import { useGlitchStore } from "@/store/useGlitchStore";

export function LeftToolbar() {
  const activeTool = useGlitchStore((state) => state.activeTool);
  const brushSize = useGlitchStore((state) => state.brushSize);
  const maskOpacity = useGlitchStore((state) => state.maskOpacity);
  const baseImage = useGlitchStore((state) => state.baseImage);
  const setActiveTool = useGlitchStore((state) => state.setActiveTool);
  const setBrushSize = useGlitchStore((state) => state.setBrushSize);
  const setMaskOpacity = useGlitchStore((state) => state.setMaskOpacity);
  const clearMask = useGlitchStore((state) => state.clearMask);

  const disabled = !baseImage;

  return (
    <aside className="flex w-56 flex-col gap-4 border-r border-zinc-800 bg-zinc-950/80 p-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Tools
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            active={activeTool === "brush"}
            disabled={disabled}
            onClick={() => setActiveTool("brush")}
          >
            Brush
          </Button>
          <Button
            variant="ghost"
            active={activeTool === "eraser"}
            disabled={disabled}
            onClick={() => setActiveTool("eraser")}
          >
            Eraser
          </Button>
        </div>
      </div>

      <SliderControl
        label="Brush Size"
        value={brushSize}
        min={4}
        max={120}
        onChange={setBrushSize}
        suffix="px"
      />

      <SliderControl
        label="Mask Preview"
        value={Math.round(maskOpacity * 100)}
        min={10}
        max={90}
        onChange={(value) => setMaskOpacity(value / 100)}
        suffix="%"
      />

      <Button variant="secondary" disabled={disabled} onClick={clearMask}>
        Clear Mask
      </Button>
    </aside>
  );
}
