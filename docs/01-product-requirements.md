# Glitch Studio Product Requirements Document

## Product Name

Glitch Studio

## One-Line Description

A browser-based glitch art studio where users upload an image, select exact areas, apply controlled glitch effects only to those regions, stack edits as non-destructive layers, and export the finished artwork.

## Product Vision

Glitch Studio should feel like a serious creative tool, not a novelty filter app. The goal is to give artists, NFT creators, designers, photographers, and experimental media makers precise control over digital corruption.

Users should be able to damage only the parts of an image they choose. A face, eye, hand, object, background section, or clothing detail can be selected and glitched without destroying the full image.

The final result should feel intentional, premium, and artistic.

## Target Users

- Digital artists
- NFT creators
- Photographers
- Web3 creators
- Experimental designers
- Social media content creators
- Musicians and cover-art creators
- People who want creative image corruption without learning Photoshop

## Core User Story

As a creator, I want to upload an image, paint over the part I want to glitch, apply a visual corruption effect only to that area, adjust the effect as a layer, and export the finished artwork.

## Phase 1 MVP Goal

Build a working browser app with the following:

1. Upload image
2. Display image correctly on canvas
3. Paint a mask over selected areas
4. Erase or clear the mask
5. Apply RGB split only inside the mask
6. Apply pixel stretch only inside the mask
7. Save every applied effect as an editable layer
8. Toggle layer visibility
9. Adjust layer opacity
10. Rename, duplicate, and delete layers
11. Export final image as PNG at original uploaded resolution

## What Phase 1 Must Not Be

- Not a fake UI prototype
- Not a basic full-image filter app
- Not destructive editing
- Not a low-resolution preview exporter
- Not a giant one-file React experiment
- Not dependent on a backend

## Phase 1 Success Criteria

A user can upload a JPG or PNG, paint over one area, apply an RGB split, paint another area, apply pixel stretch, control the resulting layers, and export the final PNG without the mask overlay or UI appearing in the export.

## Design Feel

The app should feel like high-end creative software mixed with an experimental glitch lab.

Visual direction:

- Dark
- Clean
- Sharp
- Minimal
- Professional
- Slightly futuristic
- Premium, not childish
- No cartoon styling
- No loud neon overload

Suggested layout:

- Top bar for global actions
- Left toolbar for tools
- Center canvas workspace
- Right panel for layers
- Bottom panel for controls

## Phase 1 Feature List

### Image Upload

Users can upload JPG, PNG, or WebP images.

Requirements:

- Show image on canvas
- Preserve aspect ratio
- Fit image into workspace
- Keep original image resolution for export
- Store base image separately from glitch layers

### Mask Painting

Users can paint over the image to select glitch regions.

Requirements:

- Brush selection tool
- Eraser tool
- Clear mask button
- Brush size slider
- Visible semi-transparent mask overlay
- Cursor circle preview
- Mask must align exactly with the displayed image
- Mask must only affect image bounds

### Glitch Effects

Phase 1 includes two effects:

1. RGB Split
2. Pixel Stretch

Each effect must apply only inside the mask.

### Layer System

Every applied glitch becomes a separate non-destructive layer.

Layer requirements:

- Name
- Visibility toggle
- Opacity slider
- Duplicate
- Delete
- Rename
- Selected/active state

The base uploaded image is locked and untouched.

### Export

Export PNG should render the final artwork only.

Requirements:

- No UI included
- No mask overlay included
- Use original image resolution
- Respect layer order
- Respect visibility
- Respect opacity

## Future Features

Do not build these in Phase 1, but structure the code so they can be added later:

- Lasso selection
- Magic selection
- Mask feathering
- 3D depth glitch
- Parallax preview
- Floating fragments
- Shader/WebGL effects
- Animated GIF export
- MP4 export
- Presets
- Project saving
- Before/after slider
