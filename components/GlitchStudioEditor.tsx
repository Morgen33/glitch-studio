"use client";

import { CanvasWorkspace } from "@/components/CanvasWorkspace";
import { EffectControls } from "@/components/EffectControls";
import { LayersPanel } from "@/components/LayersPanel";
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopBar } from "@/components/TopBar";

export function GlitchStudioEditor() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftToolbar />
        <div className="flex min-w-0 flex-1 flex-col">
          <CanvasWorkspace />
          <EffectControls />
        </div>
        <LayersPanel />
      </div>
    </div>
  );
}
