export type Tool = "brush" | "eraser";

export type GlitchEffectType =
  | "rgbSplit"
  | "pixelStretch"
  | "scanlines"
  | "digitalNoise"
  | "vhsTracking"
  | "signalBands"
  | "chromaticBlur"
  | "posterize"
  | "holographicNoise"
  | "edgeBleed"
  | "digitalDecay"
  | "sliceShift"
  | "blockCorruption"
  | "colorShift"
  | "waveDistort"
  | "channelSwap"
  | "bitCrush"
  | "pixelSort"
  | "interlace"
  | "snowStatic";

export type BlendMode =
  | "normal"
  | "screen"
  | "multiply"
  | "overlay"
  | "difference"
  | "lighter";

export type SeedSettings = { seed: number };

export type RGBSplitSettings = {
  amount: number;
  angle: number;
  seed: number;
};

export type PixelStretchSettings = {
  strength: number;
  direction: "horizontal" | "vertical" | "random";
  seed: number;
};

export type ScanlinesSettings = {
  spacing: number;
  intensity: number;
  seed: number;
};

export type DigitalNoiseSettings = {
  intensity: number;
  grainSize: number;
  seed: number;
};

export type VhsTrackingSettings = {
  wobble: number;
  tearStrength: number;
  seed: number;
};

export type SignalBandsSettings = {
  bandCount: number;
  shiftAmount: number;
  seed: number;
};

export type ChromaticBlurSettings = {
  blurRadius: number;
  channelOffset: number;
  seed: number;
};

export type PosterizeSettings = {
  levels: number;
  seed: number;
};

export type HolographicNoiseSettings = {
  intensity: number;
  shimmer: number;
  seed: number;
};

export type EdgeBleedSettings = {
  threshold: number;
  bleedDistance: number;
  seed: number;
};

export type DigitalDecaySettings = {
  blockSize: number;
  corruption: number;
  seed: number;
};

export type SliceShiftSettings = {
  sliceHeight: number;
  maxShift: number;
  seed: number;
};

export type BlockCorruptionSettings = {
  blockSize: number;
  density: number;
  seed: number;
};

export type ColorShiftSettings = {
  hueShift: number;
  saturation: number;
  seed: number;
};

export type WaveDistortSettings = {
  amplitude: number;
  frequency: number;
  direction: "horizontal" | "vertical";
  seed: number;
};

export type ChannelSwapSettings = {
  mode: "rb" | "rg" | "gb" | "brg";
  seed: number;
};

export type BitCrushSettings = {
  bitDepth: number;
  seed: number;
};

export type PixelSortSettings = {
  threshold: number;
  streakLength: number;
  direction: "horizontal" | "vertical";
  seed: number;
};

export type InterlaceSettings = {
  lineOffset: number;
  intensity: number;
  seed: number;
};

export type SnowStaticSettings = {
  intensity: number;
  flicker: number;
  seed: number;
};

export type EffectSettingsMap = {
  rgbSplit: RGBSplitSettings;
  pixelStretch: PixelStretchSettings;
  scanlines: ScanlinesSettings;
  digitalNoise: DigitalNoiseSettings;
  vhsTracking: VhsTrackingSettings;
  signalBands: SignalBandsSettings;
  chromaticBlur: ChromaticBlurSettings;
  posterize: PosterizeSettings;
  holographicNoise: HolographicNoiseSettings;
  edgeBleed: EdgeBleedSettings;
  digitalDecay: DigitalDecaySettings;
  sliceShift: SliceShiftSettings;
  blockCorruption: BlockCorruptionSettings;
  colorShift: ColorShiftSettings;
  waveDistort: WaveDistortSettings;
  channelSwap: ChannelSwapSettings;
  bitCrush: BitCrushSettings;
  pixelSort: PixelSortSettings;
  interlace: InterlaceSettings;
  snowStatic: SnowStaticSettings;
};

export type EffectSettings = EffectSettingsMap[GlitchEffectType];

export type GlitchLayer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  effectType: GlitchEffectType;
  settings: EffectSettings;
  maskDataUrl: string;
  createdAt: number;
};

export type ImageFitInfo = {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type HistorySnapshot = {
  layers: GlitchLayer[];
  maskDataUrl: string | null;
};

export type EffectControlDef =
  | {
      type: "slider";
      key: string;
      label: string;
      min: number;
      max: number;
      step?: number;
      suffix?: string;
    }
  | {
      type: "select";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    };

export type EffectDefinition = {
  type: GlitchEffectType;
  label: string;
  category: string;
  defaultSettings: EffectSettings;
  controls: EffectControlDef[];
};
