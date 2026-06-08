import { bitCrush } from "@/lib/effects/bitCrush";
import { blockCorruption } from "@/lib/effects/blockCorruption";
import { channelSwap } from "@/lib/effects/channelSwap";
import { chromaticBlur } from "@/lib/effects/chromaticBlur";
import { colorShift } from "@/lib/effects/colorShift";
import { digitalDecay } from "@/lib/effects/digitalDecay";
import { digitalNoise } from "@/lib/effects/digitalNoise";
import { edgeBleed } from "@/lib/effects/edgeBleed";
import { holographicNoise } from "@/lib/effects/holographicNoise";
import { interlace } from "@/lib/effects/interlace";
import { pixelSort } from "@/lib/effects/pixelSort";
import { pixelStretch } from "@/lib/effects/pixelStretch";
import { posterize } from "@/lib/effects/posterize";
import { rgbSplit } from "@/lib/effects/rgbSplit";
import { scanlines } from "@/lib/effects/scanlines";
import { signalBands } from "@/lib/effects/signalBands";
import { sliceShift } from "@/lib/effects/sliceShift";
import { snowStatic } from "@/lib/effects/snowStatic";
import { vhsTracking } from "@/lib/effects/vhsTracking";
import { waveDistort } from "@/lib/effects/waveDistort";
import { randomSeed } from "@/lib/utils/random";
import type {
  EffectDefinition,
  EffectSettings,
  EffectSettingsMap,
  GlitchEffectType,
  GlitchLayer,
} from "@/types/glitch";
import { blendWithMask } from "@/lib/effects/applyMask";

type EffectRunner = (
  source: ImageData,
  mask: ImageData,
  settings: EffectSettings
) => ImageData;

export const EFFECT_DEFINITIONS: EffectDefinition[] = [
  {
    type: "rgbSplit",
    label: "RGB Split",
    category: "Channel",
    defaultSettings: { amount: 12, angle: 0, seed: randomSeed() },
    controls: [
      { type: "slider", key: "amount", label: "Amount", min: 1, max: 80, suffix: "px" },
      { type: "slider", key: "angle", label: "Angle", min: 0, max: 360, suffix: "deg" },
    ],
  },
  {
    type: "pixelStretch",
    label: "Pixel Stretch",
    category: "Displacement",
    defaultSettings: {
      strength: 16,
      direction: "horizontal",
      seed: randomSeed(),
    },
    controls: [
      { type: "slider", key: "strength", label: "Strength", min: 2, max: 80 },
      {
        type: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
          { value: "random", label: "Random" },
        ],
      },
    ],
  },
  {
    type: "scanlines",
    label: "Scanlines",
    category: "CRT",
    defaultSettings: { spacing: 4, intensity: 50, seed: randomSeed() },
    controls: [
      { type: "slider", key: "spacing", label: "Spacing", min: 2, max: 20, suffix: "px" },
      { type: "slider", key: "intensity", label: "Intensity", min: 10, max: 100, suffix: "%" },
    ],
  },
  {
    type: "digitalNoise",
    label: "Digital Noise",
    category: "Noise",
    defaultSettings: { intensity: 45, grainSize: 1, seed: randomSeed() },
    controls: [
      { type: "slider", key: "intensity", label: "Intensity", min: 5, max: 100, suffix: "%" },
      { type: "slider", key: "grainSize", label: "Grain Size", min: 1, max: 8 },
    ],
  },
  {
    type: "vhsTracking",
    label: "VHS Tracking",
    category: "Analog",
    defaultSettings: { wobble: 8, tearStrength: 30, seed: randomSeed() },
    controls: [
      { type: "slider", key: "wobble", label: "Wobble", min: 1, max: 30 },
      { type: "slider", key: "tearStrength", label: "Tear Strength", min: 5, max: 80 },
    ],
  },
  {
    type: "signalBands",
    label: "Signal Bands",
    category: "Analog",
    defaultSettings: { bandCount: 8, shiftAmount: 40, seed: randomSeed() },
    controls: [
      { type: "slider", key: "bandCount", label: "Band Count", min: 2, max: 24 },
      { type: "slider", key: "shiftAmount", label: "Shift Amount", min: 5, max: 120, suffix: "px" },
    ],
  },
  {
    type: "chromaticBlur",
    label: "Chromatic Blur",
    category: "Channel",
    defaultSettings: { blurRadius: 3, channelOffset: 8, seed: randomSeed() },
    controls: [
      { type: "slider", key: "blurRadius", label: "Blur Radius", min: 1, max: 10 },
      { type: "slider", key: "channelOffset", label: "Channel Offset", min: 1, max: 40, suffix: "px" },
    ],
  },
  {
    type: "posterize",
    label: "Posterize",
    category: "Color",
    defaultSettings: { levels: 6, seed: randomSeed() },
    controls: [
      { type: "slider", key: "levels", label: "Color Levels", min: 2, max: 16 },
    ],
  },
  {
    type: "holographicNoise",
    label: "Holographic Noise",
    category: "Noise",
    defaultSettings: { intensity: 50, shimmer: 60, seed: randomSeed() },
    controls: [
      { type: "slider", key: "intensity", label: "Intensity", min: 10, max: 100, suffix: "%" },
      { type: "slider", key: "shimmer", label: "Shimmer", min: 10, max: 100, suffix: "%" },
    ],
  },
  {
    type: "edgeBleed",
    label: "Edge Bleed",
    category: "Displacement",
    defaultSettings: { threshold: 40, bleedDistance: 6, seed: randomSeed() },
    controls: [
      { type: "slider", key: "threshold", label: "Edge Threshold", min: 10, max: 120 },
      { type: "slider", key: "bleedDistance", label: "Bleed Distance", min: 1, max: 30, suffix: "px" },
    ],
  },
  {
    type: "digitalDecay",
    label: "Digital Decay",
    category: "Corruption",
    defaultSettings: { blockSize: 12, corruption: 40, seed: randomSeed() },
    controls: [
      { type: "slider", key: "blockSize", label: "Block Size", min: 4, max: 40, suffix: "px" },
      { type: "slider", key: "corruption", label: "Corruption", min: 10, max: 100, suffix: "%" },
    ],
  },
  {
    type: "sliceShift",
    label: "Slice Shift",
    category: "Displacement",
    defaultSettings: { sliceHeight: 8, maxShift: 30, seed: randomSeed() },
    controls: [
      { type: "slider", key: "sliceHeight", label: "Slice Height", min: 2, max: 40, suffix: "px" },
      { type: "slider", key: "maxShift", label: "Max Shift", min: 5, max: 120, suffix: "px" },
    ],
  },
  {
    type: "blockCorruption",
    label: "Block Corruption",
    category: "Corruption",
    defaultSettings: { blockSize: 16, density: 35, seed: randomSeed() },
    controls: [
      { type: "slider", key: "blockSize", label: "Block Size", min: 4, max: 48, suffix: "px" },
      { type: "slider", key: "density", label: "Density", min: 5, max: 100, suffix: "%" },
    ],
  },
  {
    type: "colorShift",
    label: "Color Shift",
    category: "Color",
    defaultSettings: { hueShift: 45, saturation: 120, seed: randomSeed() },
    controls: [
      { type: "slider", key: "hueShift", label: "Hue Shift", min: -180, max: 180, suffix: "deg" },
      { type: "slider", key: "saturation", label: "Saturation", min: 0, max: 200, suffix: "%" },
    ],
  },
  {
    type: "waveDistort",
    label: "Wave Distort",
    category: "Displacement",
    defaultSettings: {
      amplitude: 12,
      frequency: 15,
      direction: "horizontal",
      seed: randomSeed(),
    },
    controls: [
      { type: "slider", key: "amplitude", label: "Amplitude", min: 1, max: 40, suffix: "px" },
      { type: "slider", key: "frequency", label: "Frequency", min: 1, max: 50 },
      {
        type: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ],
      },
    ],
  },
  {
    type: "channelSwap",
    label: "Channel Swap",
    category: "Channel",
    defaultSettings: { mode: "rb", seed: randomSeed() },
    controls: [
      {
        type: "select",
        key: "mode",
        label: "Swap Mode",
        options: [
          { value: "rb", label: "Red ↔ Blue" },
          { value: "rg", label: "Red ↔ Green" },
          { value: "gb", label: "Green ↔ Blue" },
          { value: "brg", label: "RGB Rotate" },
        ],
      },
    ],
  },
  {
    type: "bitCrush",
    label: "Bit Crush",
    category: "Color",
    defaultSettings: { bitDepth: 4, seed: randomSeed() },
    controls: [
      { type: "slider", key: "bitDepth", label: "Bit Depth", min: 1, max: 8 },
    ],
  },
  {
    type: "pixelSort",
    label: "Pixel Sort",
    category: "Corruption",
    defaultSettings: {
      threshold: 80,
      streakLength: 24,
      direction: "horizontal",
      seed: randomSeed(),
    },
    controls: [
      { type: "slider", key: "threshold", label: "Threshold", min: 0, max: 255 },
      { type: "slider", key: "streakLength", label: "Streak Length", min: 4, max: 80, suffix: "px" },
      {
        type: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ],
      },
    ],
  },
  {
    type: "interlace",
    label: "Interlace",
    category: "CRT",
    defaultSettings: { lineOffset: 4, intensity: 70, seed: randomSeed() },
    controls: [
      { type: "slider", key: "lineOffset", label: "Line Offset", min: 1, max: 20, suffix: "px" },
      { type: "slider", key: "intensity", label: "Intensity", min: 10, max: 100, suffix: "%" },
    ],
  },
  {
    type: "snowStatic",
    label: "Snow Static",
    category: "Noise",
    defaultSettings: { intensity: 55, flicker: 40, seed: randomSeed() },
    controls: [
      { type: "slider", key: "intensity", label: "Intensity", min: 10, max: 100, suffix: "%" },
      { type: "slider", key: "flicker", label: "Flicker", min: 0, max: 100, suffix: "%" },
    ],
  },
];

const EFFECT_RUNNERS: Record<GlitchEffectType, EffectRunner> = {
  rgbSplit: (source, mask, settings) =>
    rgbSplit(source, mask, settings as EffectSettingsMap["rgbSplit"]),
  pixelStretch: (source, mask, settings) =>
    pixelStretch(source, mask, settings as EffectSettingsMap["pixelStretch"]),
  scanlines: (source, mask, settings) =>
    scanlines(source, mask, settings as EffectSettingsMap["scanlines"]),
  digitalNoise: (source, mask, settings) =>
    digitalNoise(source, mask, settings as EffectSettingsMap["digitalNoise"]),
  vhsTracking: (source, mask, settings) =>
    vhsTracking(source, mask, settings as EffectSettingsMap["vhsTracking"]),
  signalBands: (source, mask, settings) =>
    signalBands(source, mask, settings as EffectSettingsMap["signalBands"]),
  chromaticBlur: (source, mask, settings) =>
    chromaticBlur(source, mask, settings as EffectSettingsMap["chromaticBlur"]),
  posterize: (source, mask, settings) =>
    posterize(source, mask, settings as EffectSettingsMap["posterize"]),
  holographicNoise: (source, mask, settings) =>
    holographicNoise(source, mask, settings as EffectSettingsMap["holographicNoise"]),
  edgeBleed: (source, mask, settings) =>
    edgeBleed(source, mask, settings as EffectSettingsMap["edgeBleed"]),
  digitalDecay: (source, mask, settings) =>
    digitalDecay(source, mask, settings as EffectSettingsMap["digitalDecay"]),
  sliceShift: (source, mask, settings) =>
    sliceShift(source, mask, settings as EffectSettingsMap["sliceShift"]),
  blockCorruption: (source, mask, settings) =>
    blockCorruption(source, mask, settings as EffectSettingsMap["blockCorruption"]),
  colorShift: (source, mask, settings) =>
    colorShift(source, mask, settings as EffectSettingsMap["colorShift"]),
  waveDistort: (source, mask, settings) =>
    waveDistort(source, mask, settings as EffectSettingsMap["waveDistort"]),
  channelSwap: (source, mask, settings) =>
    channelSwap(source, mask, settings as EffectSettingsMap["channelSwap"]),
  bitCrush: (source, mask, settings) =>
    bitCrush(source, mask, settings as EffectSettingsMap["bitCrush"]),
  pixelSort: (source, mask, settings) =>
    pixelSort(source, mask, settings as EffectSettingsMap["pixelSort"]),
  interlace: (source, mask, settings) =>
    interlace(source, mask, settings as EffectSettingsMap["interlace"]),
  snowStatic: (source, mask, settings) =>
    snowStatic(source, mask, settings as EffectSettingsMap["snowStatic"]),
};

export function createDefaultEffectDrafts(): EffectSettingsMap {
  return Object.fromEntries(
    EFFECT_DEFINITIONS.map((effect) => [
      effect.type,
      { ...effect.defaultSettings, seed: randomSeed() },
    ])
  ) as EffectSettingsMap;
}

export function getEffectDefinition(
  effectType: GlitchEffectType
): EffectDefinition {
  const definition = EFFECT_DEFINITIONS.find(
    (effect) => effect.type === effectType
  );
  if (!definition) {
    throw new Error(`Unknown effect type: ${effectType}`);
  }
  return definition;
}

export function getEffectLabel(effectType: GlitchEffectType): string {
  return getEffectDefinition(effectType).label;
}

export function applyLayerEffect(
  sourceData: ImageData,
  maskData: ImageData,
  layer: GlitchLayer
): ImageData {
  const runner = EFFECT_RUNNERS[layer.effectType];
  const effected = runner(sourceData, maskData, layer.settings);
  return blendWithMask(sourceData, effected, maskData);
}

export const EFFECT_CATEGORIES = [
  ...new Set(EFFECT_DEFINITIONS.map((effect) => effect.category)),
];
