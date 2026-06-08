"use client";

import { create } from "zustand";
import { clearLayerCache, removeLayerFromCache } from "@/lib/canvas/layerCache";
import { isMaskCanvasEmpty } from "@/lib/effects/applyMask";
import {
  createDefaultEffectDrafts,
  getEffectLabel,
} from "@/lib/effects/registry";
import { createId } from "@/lib/utils/ids";
import { randomSeed } from "@/lib/utils/random";
import type {
  EffectSettingsMap,
  GlitchEffectType,
  GlitchLayer,
  HistorySnapshot,
  Tool,
} from "@/types/glitch";

const MAX_HISTORY = 50;

type GlitchStore = {
  baseImage: HTMLImageElement | null;
  imageName: string | null;
  imageWidth: number;
  imageHeight: number;
  layers: GlitchLayer[];
  selectedLayerId: string | null;
  activeTool: Tool;
  brushSize: number;
  maskOpacity: number;
  currentEffectType: GlitchEffectType;
  effectDrafts: EffectSettingsMap;
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  maskRevision: number;
  maskCanvasRef: HTMLCanvasElement | null;
  setMaskCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  loadImage: (file: File) => Promise<void>;
  setActiveTool: (tool: Tool) => void;
  setBrushSize: (size: number) => void;
  setMaskOpacity: (opacity: number) => void;
  setCurrentEffectType: (effectType: GlitchEffectType) => void;
  updateEffectDraft: <T extends GlitchEffectType>(
    effectType: T,
    key: keyof EffectSettingsMap[T],
    value: EffectSettingsMap[T][keyof EffectSettingsMap[T]]
  ) => void;
  regenerateSeed: () => void;
  clearMask: () => void;
  applyEffect: () => boolean;
  selectLayer: (layerId: string | null) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  renameLayer: (layerId: string, name: string) => void;
  duplicateLayer: (layerId: string) => void;
  deleteLayer: (layerId: string) => void;
  reorderLayers: (activeId: string, overId: string) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

function cloneLayers(layers: GlitchLayer[]): GlitchLayer[] {
  return layers.map((layer) => ({ ...layer, settings: { ...layer.settings } }));
}

function getMaskDataUrl(canvas: HTMLCanvasElement | null): string | null {
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    return null;
  }

  return canvas.toDataURL("image/png");
}

function restoreMask(
  canvas: HTMLCanvasElement | null,
  maskDataUrl: string | null
): Promise<void> {
  return new Promise((resolve) => {
    if (!canvas) {
      resolve();
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!maskDataUrl) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve();
    };
    image.onerror = () => resolve();
    image.src = maskDataUrl;
  });
}

function createLayerName(effectType: GlitchEffectType, count: number): string {
  return `${getEffectLabel(effectType)} ${count}`;
}

export const useGlitchStore = create<GlitchStore>((set, get) => ({
  baseImage: null,
  imageName: null,
  imageWidth: 0,
  imageHeight: 0,
  layers: [],
  selectedLayerId: null,
  activeTool: "brush",
  brushSize: 30,
  maskOpacity: 0.45,
  currentEffectType: "rgbSplit",
  effectDrafts: createDefaultEffectDrafts(),
  undoStack: [],
  redoStack: [],
  maskRevision: 0,
  maskCanvasRef: null,

  setMaskCanvasRef: (canvas) => set({ maskCanvasRef: canvas }),

  loadImage: async (file) => {
    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });

    const { maskCanvasRef } = get();
    if (maskCanvasRef) {
      maskCanvasRef.width = image.naturalWidth;
      maskCanvasRef.height = image.naturalHeight;
      const ctx = maskCanvasRef.getContext("2d");
      ctx?.clearRect(0, 0, maskCanvasRef.width, maskCanvasRef.height);
    }

    clearLayerCache();

    set({
      baseImage: image,
      imageName: file.name,
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,
      layers: [],
      selectedLayerId: null,
      undoStack: [],
      redoStack: [],
      effectDrafts: createDefaultEffectDrafts(),
    });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setBrushSize: (size) => set({ brushSize: size }),
  setMaskOpacity: (opacity) => set({ maskOpacity: opacity }),
  setCurrentEffectType: (effectType) => set({ currentEffectType: effectType }),

  updateEffectDraft: (effectType, key, value) => {
    set((state) => ({
      effectDrafts: {
        ...state.effectDrafts,
        [effectType]: {
          ...state.effectDrafts[effectType],
          [key]: value,
        },
      },
    }));
  },

  regenerateSeed: () => {
    const { currentEffectType } = get();
    set((state) => ({
      effectDrafts: {
        ...state.effectDrafts,
        [currentEffectType]: {
          ...state.effectDrafts[currentEffectType],
          seed: randomSeed(),
        },
      },
    }));
  },

  clearMask: () => {
    const { maskCanvasRef } = get();
    get().pushHistory();

    if (maskCanvasRef) {
      const ctx = maskCanvasRef.getContext("2d");
      ctx?.clearRect(0, 0, maskCanvasRef.width, maskCanvasRef.height);
    }

    set((state) => ({ maskRevision: state.maskRevision + 1 }));
  },

  applyEffect: () => {
    const state = get();
    const { baseImage, maskCanvasRef, currentEffectType, layers, effectDrafts } =
      state;

    if (!baseImage || !maskCanvasRef) {
      return false;
    }

    if (isMaskCanvasEmpty(maskCanvasRef)) {
      return false;
    }

    const maskDataUrl = maskCanvasRef.toDataURL("image/png");
    const effectCount =
      layers.filter((layer) => layer.effectType === currentEffectType).length + 1;

    const settings = {
      ...effectDrafts[currentEffectType],
      seed: effectDrafts[currentEffectType].seed,
    };

    const newLayer: GlitchLayer = {
      id: createId(),
      name: createLayerName(currentEffectType, effectCount),
      visible: true,
      opacity: 1,
      blendMode: "normal",
      effectType: currentEffectType,
      settings,
      maskDataUrl,
      createdAt: Date.now(),
    };

    get().pushHistory();

    const ctx = maskCanvasRef.getContext("2d");
    ctx?.clearRect(0, 0, maskCanvasRef.width, maskCanvasRef.height);

    set((state) => ({
      layers: [...layers, newLayer],
      selectedLayerId: newLayer.id,
      effectDrafts: {
        ...state.effectDrafts,
        [currentEffectType]: {
          ...state.effectDrafts[currentEffectType],
          seed: randomSeed(),
        },
      },
      maskRevision: state.maskRevision + 1,
    }));

    return true;
  },

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  toggleLayerVisibility: (layerId) => {
    set({
      layers: get().layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      ),
    });
  },

  setLayerOpacity: (layerId, opacity) => {
    set({
      layers: get().layers.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      ),
    });
  },

  renameLayer: (layerId, name) => {
    set({
      layers: get().layers.map((layer) =>
        layer.id === layerId ? { ...layer, name } : layer
      ),
    });
  },

  duplicateLayer: (layerId) => {
    const layer = get().layers.find((item) => item.id === layerId);
    if (!layer) {
      return;
    }

    get().pushHistory();

    const duplicate: GlitchLayer = {
      ...layer,
      id: createId(),
      name: `${layer.name} Copy`,
      settings: { ...layer.settings },
      createdAt: Date.now(),
    };

    const index = get().layers.findIndex((item) => item.id === layerId);
    const nextLayers = [...get().layers];
    nextLayers.splice(index + 1, 0, duplicate);

    set({
      layers: nextLayers,
      selectedLayerId: duplicate.id,
    });
  },

  deleteLayer: (layerId) => {
    get().pushHistory();
    removeLayerFromCache(layerId);
    const nextLayers = get().layers.filter((layer) => layer.id !== layerId);
    const selectedLayerId =
      get().selectedLayerId === layerId
        ? nextLayers[nextLayers.length - 1]?.id ?? null
        : get().selectedLayerId;

    set({
      layers: nextLayers,
      selectedLayerId,
    });
  },

  reorderLayers: (activeId, overId) => {
    if (activeId === overId) {
      return;
    }

    const layers = get().layers;
    const fromIndex = layers.findIndex((layer) => layer.id === activeId);
    const toIndex = layers.findIndex((layer) => layer.id === overId);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    get().pushHistory();

    const nextLayers = [...layers];
    const [movedLayer] = nextLayers.splice(fromIndex, 1);
    nextLayers.splice(toIndex, 0, movedLayer);

    set({ layers: nextLayers });
  },

  pushHistory: () => {
    const snapshot: HistorySnapshot = {
      layers: cloneLayers(get().layers),
      maskDataUrl: getMaskDataUrl(get().maskCanvasRef),
    };

    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_HISTORY + 1), snapshot],
      redoStack: [],
    }));
  },

  undo: async () => {
    const { undoStack, redoStack, maskCanvasRef } = get();
    if (undoStack.length === 0) {
      return;
    }

    const current: HistorySnapshot = {
      layers: cloneLayers(get().layers),
      maskDataUrl: getMaskDataUrl(maskCanvasRef),
    };

    const previous = undoStack[undoStack.length - 1];

    await restoreMask(maskCanvasRef, previous.maskDataUrl);

    set((state) => ({
      layers: cloneLayers(previous.layers),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
      maskRevision: state.maskRevision + 1,
    }));
  },

  redo: async () => {
    const { redoStack, undoStack, maskCanvasRef } = get();
    if (redoStack.length === 0) {
      return;
    }

    const current: HistorySnapshot = {
      layers: cloneLayers(get().layers),
      maskDataUrl: getMaskDataUrl(maskCanvasRef),
    };

    const next = redoStack[redoStack.length - 1];

    await restoreMask(maskCanvasRef, next.maskDataUrl);

    set((state) => ({
      layers: cloneLayers(next.layers),
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, current],
      maskRevision: state.maskRevision + 1,
    }));
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));
