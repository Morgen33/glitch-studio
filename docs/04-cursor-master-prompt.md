# Cursor Master Prompt for Phase 1

Use this prompt in Cursor after creating or opening the project.

---

I want you to build a real working browser-based image editor called **Glitch Studio**.

Use the documentation files in this project as the source of truth:

- `01-product-requirements.md`
- `02-technical-architecture.md`
- `03-mvp-build-plan.md`
- `05-acceptance-tests.md`

Build Phase 1 only.

The app must use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- HTML Canvas 2D API
- Client-side image processing only
- No backend

The core flow must work:

Upload image → paint a mask → apply RGB split or pixel stretch only to the masked area → save the effect as an editable layer → preview live → export final PNG.

Do not create fake buttons. Every Phase 1 button must work.

Do not permanently alter the base image.

Do not apply effects to the full image. Effects must apply only inside the selected mask.

Do not export the UI, mask overlay, or preview canvas resolution. Export at original uploaded image resolution.

Create this structure:

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

Phase 1 features required:

1. Upload JPG, PNG, or WebP.
2. Display uploaded image centered and scaled to fit the canvas area.
3. Preserve original image resolution internally.
4. Paint selection mask with brush.
5. Erase selection mask.
6. Clear mask.
7. Show semi-transparent mask overlay.
8. Show brush cursor circle.
9. Apply RGB split only inside the mask.
10. Apply pixel stretch only inside the mask.
11. Save each applied effect as a new editable layer.
12. Keep base image as locked layer.
13. Layers must support visibility, opacity, rename, duplicate, and delete.
14. Re-render composition when layers change.
15. Export final PNG at original image resolution.
16. Undo/redo buttons must be functional or disabled when unavailable.

Critical implementation details:

- The mask canvas must match image-processing dimensions.
- Mouse coordinates must be converted correctly from CSS display size to image coordinates.
- If the image is letterboxed inside the canvas, account for offset X and offset Y.
- Painting should only affect image bounds.
- The mask must line up exactly with the image.
- The uploaded base image must remain untouched.
- Every render should be reproducible from base image + layers + masks + settings.

Build the MVP in this order:

1. Types and store
2. Layout components
3. Image upload and canvas rendering
4. Coordinate mapping helpers
5. Mask painting and erasing
6. RGB split effect
7. Pixel stretch effect
8. Layer creation and layer panel
9. Export PNG
10. Basic undo/redo or disabled buttons
11. Final test against acceptance checklist

After implementation, run TypeScript checks and fix errors.

Then review the app against the acceptance tests.

Stop after Phase 1 is complete. Do not add Phase 2 features yet.
