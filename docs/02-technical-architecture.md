# Glitch Studio Technical Architecture

## Recommended Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- HTML Canvas 2D API
- Client-side image processing
- No backend for Phase 1

## Architecture Principles

1. Keep the base image untouched.
2. Store glitch effects as non-destructive layers.
3. Store masks separately from the base image.
4. Render the composition from source data every time.
5. Keep canvas logic separate from React UI components.
6. Do not store huge ImageData objects directly in Zustand unless absolutely necessary.
7. Export from an offscreen canvas at original image resolution.

## Proposed Folder Structure

```txt
app/
  page.tsx
  globals.css

components/
  TopBar.tsx
  LeftToolbar.tsx
  CanvasWorkspace.tsx
  LayersPanel.tsx
  EffectControls.tsx
  SliderControl.tsx
  Button.tsx

lib/
  canvas/
    drawImageToFit.ts
    coordinates.ts
    exportComposition.ts
    renderComposition.ts
  effects/
    rgbSplit.ts
    pixelStretch.ts
    applyMask.ts
  utils/
    ids.ts
    random.ts

store/
  useGlitchStore.ts

types/
  glitch.ts
```

## State Model

```ts
type Tool = "brush" | "eraser";

type GlitchEffectType = "rgbSplit" | "pixelStretch";

type BlendMode =
  | "normal"
  | "screen"
  | "multiply"
  | "overlay"
  | "difference"
  | "lighter";

type RGBSplitSettings = {
  amount: number;
  angle: number;
  seed: number;
};

type PixelStretchSettings = {
  strength: number;
  direction: "horizontal" | "vertical" | "random";
  seed: number;
};

type GlitchLayer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  effectType: GlitchEffectType;
  settings: RGBSplitSettings | PixelStretchSettings;
  maskDataUrl: string;
  createdAt: number;
};

type ProjectState = {
  uploadedImage: HTMLImageElement | null;
  imageName: string | null;
  imageWidth: number;
  imageHeight: number;
  layers: GlitchLayer[];
  selectedLayerId: string | null;
  activeTool: Tool;
  brushSize: number;
  maskOpacity: number;
  currentEffectType: GlitchEffectType;
  rgbSplitAmount: number;
  pixelStretchStrength: number;
  pixelStretchDirection: "horizontal" | "vertical" | "random";
  seed: number;
};
```

## Canvas Strategy

Use separate canvas layers internally:

1. Preview canvas: displays the current composition in the UI.
2. Active mask canvas: stores the current editable mask.
3. Offscreen render canvas: used for generating layers and export.

Optional visual stacking:

- Main canvas for rendered image
- Overlay canvas for mask preview and brush cursor

## Coordinate Mapping

Canvas coordinate mapping is critical.

The image may be scaled to fit the viewport, but masks and effects must match the original image coordinates.

Use helpers to calculate:

- Displayed image width
- Displayed image height
- Offset X
- Offset Y
- Scale ratio between display size and natural image size

Example concept:

```ts
const rect = canvas.getBoundingClientRect();
const displayX = event.clientX - rect.left;
const displayY = event.clientY - rect.top;

const imageX = (displayX - imageOffsetX) / imageDisplayScale;
const imageY = (displayY - imageOffsetY) / imageDisplayScale;
```

Do not allow painting outside the displayed image area.

## Rendering Pipeline

Final composition should render from scratch:

1. Clear canvas.
2. Draw base image.
3. Loop through visible glitch layers from bottom to top.
4. For each layer:
   - Generate effect from base image.
   - Apply saved mask.
   - Draw layer result onto composition canvas.
   - Respect opacity.
   - Respect blend mode if possible.
5. Display final composition.

## Non-Destructive Editing Rule

The uploaded image is always the source.

Layers contain:

- Effect type
- Effect settings
- Mask
- Opacity
- Visibility
- Blend mode

No effect should permanently modify the original uploaded image.

## RGB Split Implementation Notes

RGB split should work by reading ImageData and offsetting channels.

Basic approach:

- Read source pixels.
- For each pixel inside the mask:
  - Red channel samples from x - amount.
  - Green channel samples from original pixel or slight offset.
  - Blue channel samples from x + amount.
- Preserve alpha.
- Use mask alpha to decide whether effect is visible.

## Pixel Stretch Implementation Notes

Pixel stretch should repeat or smear pixels within masked regions.

Horizontal mode:

- Find masked pixels.
- Stretch sampled pixels left/right in short streaks.

Vertical mode:

- Stretch sampled pixels up/down.

Random mode:

- Use seed-based pseudo-random streak lengths and directions.

Always clamp coordinates to image bounds.

## Export Strategy

Export must use an offscreen canvas at the original image size.

Export flow:

1. Create canvas with `image.naturalWidth` and `image.naturalHeight`.
2. Render base image.
3. Render all visible glitch layers.
4. Exclude active mask overlay.
5. Convert to PNG data URL.
6. Trigger download.

Filename format:

```txt
glitch-studio-export-[timestamp].png
```

## Performance Notes

- Avoid rerendering on every unnecessary state change.
- Debounce slider updates if needed.
- Keep heavy processing in helper functions.
- Avoid storing full ImageData history in Zustand.
- Use data URLs or offscreen canvas references for masks.
- Later versions can move heavy effects to Web Workers or WebGL.
