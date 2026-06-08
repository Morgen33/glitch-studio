"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SliderControl } from "@/components/SliderControl";
import { EyeIcon, EyeOffIcon, GripIcon, TrashIcon } from "@/components/icons";
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
  const reorderLayers = useGlitchStore((state) => state.reorderLayers);

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  const [localOpacity, setLocalOpacity] = useState(100);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const opacityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedLayers = [...layers].reverse();

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

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    layerId: string
  ) => {
    setDraggingLayerId(layerId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", layerId);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLElement>,
    layerId: string
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(layerId);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLElement>,
    overId: string
  ) => {
    event.preventDefault();
    const activeId = event.dataTransfer.getData("text/plain");

    if (activeId) {
      reorderLayers(activeId, overId);
    }

    setDraggingLayerId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggingLayerId(null);
    setDropTargetId(null);
  };

  return (
    <aside className="flex w-72 flex-col border-l border-zinc-800 bg-zinc-950/80">
      <div className="border-b border-zinc-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Layers
        </p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Drag to reorder · top = front
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {displayedLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const isDragging = draggingLayerId === layer.id;
          const isDropTarget =
            dropTargetId === layer.id && draggingLayerId !== layer.id;

          return (
            <div
              key={layer.id}
              draggable
              onDragStart={(event) => handleDragStart(event, layer.id)}
              onDragOver={(event) => handleDragOver(event, layer.id)}
              onDrop={(event) => handleDrop(event, layer.id)}
              onDragEnd={handleDragEnd}
              onClick={() => selectLayer(layer.id)}
              className={[
                "group cursor-pointer rounded-lg border p-2.5 transition-colors",
                isSelected
                  ? "border-violet-500/60 bg-violet-500/10"
                  : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70",
                isDragging ? "opacity-40" : "",
                isDropTarget ? "border-violet-400 ring-1 ring-violet-400/40" : "",
                !layer.visible ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => handleDragStart(event, layer.id)}
                  onClick={(event) => event.stopPropagation()}
                  className="cursor-grab text-zinc-600 hover:text-zinc-300 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripIcon />
                </button>

                <div className="min-w-0 flex-1">
                  <input
                    value={layer.name}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      renameLayer(layer.id, event.target.value)
                    }
                    className="w-full rounded bg-transparent text-sm font-medium text-zinc-100 outline-none"
                  />
                  <p className="truncate text-xs text-zinc-500">
                    {getEffectLabel(layer.effectType)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                  title={layer.visible ? "Hide layer" : "Show layer"}
                >
                  {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-red-950/60 hover:text-red-300"
                  title="Delete layer"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
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
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => duplicateLayer(selectedLayer.id)}
          >
            Duplicate Layer
          </Button>
        </div>
      )}
    </aside>
  );
}
