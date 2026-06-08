"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SliderControl } from "@/components/SliderControl";
import { getEffectLabel } from "@/lib/effects/registry";
import { useGlitchStore } from "@/store/useGlitchStore";

export function LayersPanel() {
  const baseImage = useGlitchStore((state) => state.baseImage);
  const imageName = useGlitchStore((state) => state.imageName);
  const layers = useGlitchStore((state) => state.layers);
  const selectedLayerId = useGlitchStore((state) => state.selectedLayerId);
  const selectLayer = useGlitchStore((state) => state.selectLayer);
  const toggleLayerVisibility = useGlitchStore(
    (state) => state.toggleLayerVisibility
  );
  const setLayerOpacity = useGlitchStore((state) => state.setLayerOpacity);
  const renameLayer = useGlitchStore((state) => state.renameLayer);
  const duplicateLayer = useGlitchStore((state) => state.duplicateLayer);
  const deleteLayer = useGlitchStore((state) => state.deleteLayer);

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const [localOpacity, setLocalOpacity] = useState(100);
  const opacityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedLayer) {
      setLocalOpacity(Math.round(selectedLayer.opacity * 100));
    }
  }, [selectedLayer?.id, selectedLayer?.opacity]);

  useEffect(() => {
    return () => {
      if (opacityDebounceRef.current) {
        clearTimeout(opacityDebounceRef.current);
      }
    };
  }, []);

  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value);

    if (!selectedLayer) {
      return;
    }

    if (opacityDebounceRef.current) {
      clearTimeout(opacityDebounceRef.current);
    }

    opacityDebounceRef.current = setTimeout(() => {
      setLayerOpacity(selectedLayer.id, value / 100);
    }, 100);
  };

  return (
    <aside className="flex w-72 flex-col border-l border-zinc-800 bg-zinc-950/80">
      <div className="border-b border-zinc-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Layers
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">Base Image</p>
              <p className="truncate text-xs text-zinc-500">
                {imageName ?? "Locked source layer"}
              </p>
            </div>
            <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
              Locked
            </span>
          </div>
        </div>

        {layers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => selectLayer(layer.id)}
              className={[
                "w-full rounded-lg border p-3 text-left transition-colors",
                isSelected
                  ? "border-violet-500/60 bg-violet-500/10"
                  : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  value={layer.name}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => renameLayer(layer.id, event.target.value)}
                  className="w-full rounded bg-transparent text-sm font-medium text-zinc-100 outline-none"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                >
                  {layer.visible ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {getEffectLabel(layer.effectType)}
              </p>
            </button>
          );
        })}

        {!baseImage && (
          <p className="px-2 py-6 text-center text-sm text-zinc-500">
            Upload an image to start layering effects.
          </p>
        )}
      </div>

      {selectedLayer && (
        <div className="space-y-3 border-t border-zinc-800 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Layer Settings
          </p>
          <SliderControl
            label="Opacity"
            value={localOpacity}
            min={0}
            max={100}
            onChange={handleOpacityChange}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => duplicateLayer(selectedLayer.id)}
            >
              Duplicate
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteLayer(selectedLayer.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
