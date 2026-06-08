# Glitch Studio MVP Build Plan

## Build Philosophy

Build the working editor first. Do not build the dream version all at once.

The MVP should prove the core mechanic:

Upload image → paint selection → apply glitch only to selection → save as layer → export final art.

## Phase 1 Scope

### Must Build

- Next.js app setup
- Dark editor layout
- Image upload
- Canvas preview
- Brush mask painting
- Eraser
- Clear mask
- RGB split effect
- Pixel stretch effect
- Layer creation
- Layer visibility toggle
- Layer opacity control
- Rename layer
- Duplicate layer
- Delete layer
- Export PNG

### Do Not Build Yet

- 3D effects
- Lasso
- Magic select
- Animated export
- User accounts
- Backend
- Saved projects
- Marketplace
- Preset packs

## Step-by-Step Implementation

### Step 1: Project Setup

Create a Next.js app with TypeScript and Tailwind.

Install Zustand.

Create the folder structure from the architecture document.

### Step 2: UI Shell

Create the editor layout:

- TopBar
- LeftToolbar
- CanvasWorkspace
- LayersPanel
- EffectControls

No fake buttons. If a button exists in Phase 1, it must work.

### Step 3: Image Upload

Implement upload flow:

- Accept JPG, PNG, WebP
- Convert file to image object
- Store natural dimensions
- Draw image to canvas preview
- Fit image inside center workspace

### Step 4: Canvas Fit Logic

Create a helper for drawing image to fit:

Inputs:

- Canvas width
- Canvas height
- Image natural width
- Image natural height

Outputs:

- Draw width
- Draw height
- Offset X
- Offset Y
- Scale

This will be reused for pointer mapping.

### Step 5: Mask Painting

Implement active mask canvas:

- Brush paints white into mask
- Eraser removes from mask
- Clear mask clears it
- Show semi-transparent overlay in preview
- Brush cursor circle follows mouse

Critical: coordinate mapping must account for image scaling and offsets.

### Step 6: RGB Split Effect

Create `rgbSplit.ts`.

It should accept:

- Source ImageData
- Mask ImageData
- Settings

It should return effected ImageData.

Only masked pixels should change.

### Step 7: Pixel Stretch Effect

Create `pixelStretch.ts`.

It should accept:

- Source ImageData
- Mask ImageData
- Settings

It should return effected ImageData.

Only masked pixels should change.

### Step 8: Apply Effect as Layer

When user applies effect:

1. Check if image exists.
2. Check if mask is not empty.
3. Save mask as data URL.
4. Create new layer with effect settings.
5. Add layer above base image.
6. Clear active mask.
7. Re-render composition.

### Step 9: Layer Panel

Build right panel with:

- Locked base layer
- Glitch layers above it
- Visibility toggle
- Opacity slider
- Rename input
- Duplicate button
- Delete button

Changing these should re-render immediately.

### Step 10: Export PNG

Create `exportComposition.ts`.

Use original image dimensions, not preview canvas dimensions.

Do not include UI or mask overlay.

## Phase 1 Deliverable

A working local web app where the user can:

1. Upload an image.
2. Paint a selection.
3. Apply RGB split only to that selection.
4. Paint another selection.
5. Apply pixel stretch only to that selection.
6. Control layers.
7. Export the final PNG.

## Build Stopping Point

After Phase 1 is working, stop. Do not continue into Phase 2 until the MVP is tested.
