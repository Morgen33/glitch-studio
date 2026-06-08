"use client";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
};

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: SliderControlProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-200">
          {value}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-violet-500"
      />
    </label>
  );
}
