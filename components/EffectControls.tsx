"use client";

import { Button } from "@/components/Button";
import { SliderControl } from "@/components/SliderControl";
import {
  EFFECT_CATEGORIES,
  EFFECT_DEFINITIONS,
  getEffectDefinition,
} from "@/lib/effects/registry";
import { useGlitchStore } from "@/store/useGlitchStore";
import type { EffectSettingsMap, GlitchEffectType } from "@/types/glitch";

export function EffectControls() {
  const baseImage = useGlitchStore((state) => state.baseImage);
  const currentEffectType = useGlitchStore((state) => state.currentEffectType);
  const effectDrafts = useGlitchStore((state) => state.effectDrafts);
  const setCurrentEffectType = useGlitchStore(
    (state) => state.setCurrentEffectType
  );
  const updateEffectDraft = useGlitchStore((state) => state.updateEffectDraft);
  const regenerateSeed = useGlitchStore((state) => state.regenerateSeed);
  const applyEffect = useGlitchStore((state) => state.applyEffect);

  const disabled = !baseImage;
  const currentDefinition = getEffectDefinition(currentEffectType);
  const currentDraft = effectDrafts[currentEffectType];

  const handleApply = () => {
    const applied = applyEffect();
    if (!applied) {
      window.alert("Paint a mask before applying an effect.");
    }
  };

  const updateDraftValue = (
    key: string,
    value: string | number
  ) => {
    updateEffectDraft(
      currentEffectType,
      key as keyof EffectSettingsMap[typeof currentEffectType],
      value as EffectSettingsMap[typeof currentEffectType][keyof EffectSettingsMap[typeof currentEffectType]]
    );
  };

  return (
    <section className="border-t border-zinc-800 bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Effects Library
            </p>
            <p className="text-sm text-zinc-400">
              {EFFECT_DEFINITIONS.length} selective glitch effects
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={disabled} onClick={regenerateSeed}>
              New Seed
            </Button>
            <Button variant="primary" disabled={disabled} onClick={handleApply}>
              Apply to Mask
            </Button>
          </div>
        </div>

        <div className="max-h-36 space-y-3 overflow-y-auto pr-1">
          {EFFECT_CATEGORIES.map((category) => (
            <div key={category}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {EFFECT_DEFINITIONS.filter(
                  (effect) => effect.category === category
                ).map((effect) => (
                  <Button
                    key={effect.type}
                    variant="ghost"
                    active={currentEffectType === effect.type}
                    disabled={disabled}
                    onClick={() =>
                      setCurrentEffectType(effect.type as GlitchEffectType)
                    }
                    className="text-xs"
                  >
                    {effect.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-200">
            {currentDefinition.label} Settings
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentDefinition.controls.map((control) => {
              if (control.type === "slider") {
                return (
                  <SliderControl
                    key={control.key}
                    label={control.label}
                    value={
                      currentDraft[control.key as keyof typeof currentDraft] as number
                    }
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    suffix={control.suffix}
                    onChange={(value) => updateDraftValue(control.key, value)}
                  />
                );
              }

              const currentValue = String(
                currentDraft[control.key as keyof typeof currentDraft]
              );

              return (
                <div key={control.key} className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">
                    {control.label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {control.options.map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        active={currentValue === option.value}
                        disabled={disabled}
                        onClick={() => updateDraftValue(control.key, option.value)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
