"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  active?: boolean;
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-500 border border-violet-500/50",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
  ghost:
    "bg-transparent text-zinc-300 hover:bg-zinc-800/80 border border-transparent",
  danger:
    "bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-900/50",
};

export function Button({
  children,
  variant = "secondary",
  active = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        active ? "ring-1 ring-violet-400/70 bg-zinc-700/80" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
