# Glitch Studio Phase 1 Acceptance Tests

Use this checklist before calling Phase 1 complete.

## Upload Tests

- [ ] User can upload a JPG.
- [ ] User can upload a PNG.
- [ ] User can upload a WebP.
- [ ] Uploaded image appears centered.
- [ ] Uploaded image preserves aspect ratio.
- [ ] Uploaded image is not stretched.
- [ ] App stores original image resolution for export.

## Mask Tests

- [ ] Brush tool paints over the image.
- [ ] Brush strokes align exactly with cursor.
- [ ] Brush does not paint outside image bounds.
- [ ] Eraser removes parts of the mask.
- [ ] Clear mask button clears the active mask.
- [ ] Mask overlay is visible while editing.
- [ ] Brush cursor circle is visible.
- [ ] Brush size slider changes brush size.
- [ ] Mask remains aligned when image is scaled to fit workspace.

## RGB Split Tests

- [ ] RGB split applies only to masked area.
- [ ] Unmasked areas remain unchanged.
- [ ] RGB split amount slider affects the result.
- [ ] RGB split creates a new layer.
- [ ] Active mask clears after layer is created.

## Pixel Stretch Tests

- [ ] Pixel stretch applies only to masked area.
- [ ] Unmasked areas remain unchanged.
- [ ] Pixel stretch strength slider affects the result.
- [ ] Horizontal direction works.
- [ ] Vertical direction works.
- [ ] Random direction works.
- [ ] Pixel stretch creates a new layer.
- [ ] Active mask clears after layer is created.

## Layer Tests

- [ ] Base image appears as a locked base layer.
- [ ] New glitch layers appear above base image.
- [ ] Layer visibility toggle works.
- [ ] Layer opacity slider works.
- [ ] Rename layer works.
- [ ] Duplicate layer works.
- [ ] Delete layer works.
- [ ] Canvas re-renders after layer changes.
- [ ] Deleting a layer does not damage the base image.

## Export Tests

- [ ] Export button downloads PNG.
- [ ] Export includes base image and visible glitch layers.
- [ ] Export does not include UI.
- [ ] Export does not include mask overlay.
- [ ] Export respects layer opacity.
- [ ] Export respects layer visibility.
- [ ] Export uses original uploaded image resolution.
- [ ] Filename includes timestamp.

## Undo/Redo Tests

- [ ] Undo button is either functional or disabled when unavailable.
- [ ] Redo button is either functional or disabled when unavailable.
- [ ] No fake undo/redo buttons.

## No-Fake-UI Tests

- [ ] No Phase 1 button is fake.
- [ ] No Phase 1 slider is disconnected.
- [ ] No layer controls are visual-only.
- [ ] No effect button applies to the entire image by accident.
- [ ] No destructive editing of the base image.

## Final User Flow Test

A complete successful test looks like this:

1. Upload a PNG.
2. Paint over one part of the image.
3. Apply RGB split.
4. Confirm only painted area changes.
5. Paint a different area.
6. Apply pixel stretch.
7. Rename one layer.
8. Lower layer opacity.
9. Hide/show a layer.
10. Duplicate a layer.
11. Delete a layer.
12. Export PNG.
13. Open exported PNG and confirm the final artwork looks correct.
